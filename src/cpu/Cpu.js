var R65816 = require('../r65816/R65816'),
    Dma = require('./dma/Dma'),
    CpuStatus = require('./CpuStatus'),
    Memory = require('./memory/Memory'),
    Mmio = require('./mmio/Mmio');
    // #include "timing/timing.hpp"

var Cpu = function(sfc) {
    this.sfc = sfc;

    this.wram = new Uint8Array(128 * 1024);

    //enum : bool { Threaded = true };
    //vector<Thread*> coprocessors;

    //uint8 port_read(uint2 port) const;
    //void port_write(uint2 port, uint8 data);

    //uint8 pio();
    //bool joylatch();

    this.cpu_version = 0;

    //dma implementation
    this.dma = new Dma(this);

    //memory implementation
    this.memory = new Memory(this);

    //mmio implementation
    this.mmio = new Mmio(this);

    //current CPU status
    this.status = new CpuStatus(this);

    //the ALU status
    this.alu = {
        mpyctr: 0,
        divctr: 0,
        shift: 0
    };
};

//inherit from r65816 processor
Cpu.prototype = Object.create(R65816, {
    constructor: {
        value: Cpu,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

module.exports = Cpu;

Cpu.prototype.interrupt_pending = function() {
    return this.status.interrupt_pending;
};

Cpu.prototype.step = function(clocks) {
    smp.clock -= clocks * (uint64)smp.frequency;
    ppu.clock -= clocks;
    for(unsigned i = 0; i < coprocessors.size(); i++) {
        auto& chip = *coprocessors[i];
        chip.clock -= clocks * (uint64)chip.frequency;
    }
    input.port1->clock -= clocks * (uint64)input.port1->frequency;
    input.port2->clock -= clocks * (uint64)input.port2->frequency;
    synchronize_controllers();
};

Cpu.prototype.synchronize_smp = function() {
    if(SMP::Threaded == true) {
        if(smp.clock < 0) co_switch(smp.thread);
    } else {
        while(smp.clock < 0) smp.enter();
    }
};

Cpu.prototype.synchronize_ppu = function() {
    if(PPU::Threaded == true) {
        if(ppu.clock < 0) co_switch(ppu.thread);
    } else {
        while(ppu.clock < 0) ppu.enter();
    }
};

Cpu.prototype.synchronize_coprocessors = function() {
    for(unsigned i = 0; i < coprocessors.size(); i++) {
        auto& chip = *coprocessors[i];
        if(chip.clock < 0) co_switch(chip.thread);
    }
};

Cpu.prototype.synchronize_controllers = function() {
    if(input.port1->clock < 0) co_switch(input.port1->thread);
    if(input.port2->clock < 0) co_switch(input.port2->thread);
};

Cpu.prototype.enter = function() {
    while(true) {
        if(scheduler.sync == Scheduler::SynchronizeMode::CPU) {
            scheduler.sync = Scheduler::SynchronizeMode::All;
            scheduler.exit(Scheduler::ExitReason::SynchronizeEvent);
        }

        if(status.interrupt_pending) {
            status.interrupt_pending = false;
            if(status.nmi_pending) {
                status.nmi_pending = false;
                regs.vector = (regs.e == false ? 0xffea : 0xfffa);
                op_irq();
                debugger.op_nmi();
            } else if(status.irq_pending) {
                status.irq_pending = false;
                regs.vector = (regs.e == false ? 0xffee : 0xfffe);
                op_irq();
                debugger.op_irq();
            } else if(status.reset_pending) {
                status.reset_pending = false;
                add_clocks(186);
                regs.pc.l = bus.read(0xfffc);
                regs.pc.h = bus.read(0xfffd);
            }
        }

        op_step();
    }
};

Cpu.prototype.op_step = function() {
    debugger.op_exec(regs.pc.d);
    if(interface->tracer.open()) {
        char text[4096];
        disassemble_opcode(text, regs.pc.d);
        interface->tracer.print(text, "\n");
    }

    (this->*opcode_table[op_readpc()])();
};

Cpu.prototype.enable = function() {
    function<uint8 (unsigned)> reader = {&CPU::mmio_read, (CPU*)&cpu};
    function<void (unsigned, uint8)> writer = {&CPU::mmio_write, (CPU*)&cpu};

    bus.map(reader, writer, 0x00, 0x3f, 0x2140, 0x2183);
    bus.map(reader, writer, 0x80, 0xbf, 0x2140, 0x2183);

    bus.map(reader, writer, 0x00, 0x3f, 0x4016, 0x4017);
    bus.map(reader, writer, 0x80, 0xbf, 0x4016, 0x4017);

    bus.map(reader, writer, 0x00, 0x3f, 0x4200, 0x421f);
    bus.map(reader, writer, 0x80, 0xbf, 0x4200, 0x421f);

    bus.map(reader, writer, 0x00, 0x3f, 0x4300, 0x437f);
    bus.map(reader, writer, 0x80, 0xbf, 0x4300, 0x437f);

    reader = [](unsigned addr) { return cpu.wram[addr]; };
    writer = [](unsigned addr, uint8 data) { cpu.wram[addr] = data; };

    bus.map(reader, writer, 0x00, 0x3f, 0x0000, 0x1fff, 0x002000);
    bus.map(reader, writer, 0x80, 0xbf, 0x0000, 0x1fff, 0x002000);
    bus.map(reader, writer, 0x7e, 0x7f, 0x0000, 0xffff, 0x020000);
};

Cpu.prototype.power = function() {
    cpu_version = config.cpu.version;
    for(auto& byte : wram) byte = random(config.cpu.wram_init_value);

    regs.a = regs.x = regs.y = 0x0000;
    regs.s = 0x01ff;

    mmio_power();
    dma_power();
    timing_power();
};

Cpu.prototype.reset = function() {
    create(Enter, system.cpu_frequency());
    coprocessors.reset();
    PPUcounter::reset();

    //note: some registers are not fully reset by SNES
    regs.pc     = 0x000000;
    regs.x.h    = 0x00;
    regs.y.h    = 0x00;
    regs.s.h    = 0x01;
    regs.d      = 0x0000;
    regs.db     = 0x00;
    regs.p      = 0x34;
    regs.e      = 1;
    regs.mdr    = 0x00;
    regs.wai    = false;
    regs.vector = 0xfffc;  //reset vector address
    update_table();

    mmio_reset();
    dma_reset();
    timing_reset();
};
