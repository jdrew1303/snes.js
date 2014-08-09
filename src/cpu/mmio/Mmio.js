function Mmio(cpu) {
    this.cpu = cpu;
}

Mmio.prototype.constructor = Mmio;

module.exports = Mmio;

Mmio.prototype.pio = function() {
    return this.cpu.status.pio;
}

Mmio.prototype.joylatch = function() {
    return this.cpu.status.joypad_strobe_latch;
}

//WMDATA
Mmio.prototype.r2180 = function() {
    return this.cpu.sfc.memory.bus.read(0x7e0000 | status.wram_addr++);
}

//WMDATA
Mmio.prototype.w2180 = function(data) {
    this.cpu.sfc.memory.bus.write(0x7e0000 | this.cpu.status.wram_addr++, data);
}

//WMADDL
Mmio.prototype.w2181 = function(data) {
    this.cpu.status.wram_addr = (this.cpu.status.wram_addr & 0x01ff00) | (data <<  0);
}

//WMADDM
Mmio.prototype.w2182 = function(data) {
    this.cpu.status.wram_addr = (this.cpu.status.wram_addr & 0x0100ff) | (data <<  8);
}

//WMADDH
Mmio.prototype.w2183 = function(data) {
    this.cpu.status.wram_addr = (this.cpu.status.wram_addr & 0x00ffff) | (data << 16);
}

//JOYSER0
//bit 0 is shared between JOYSER0 and JOYSER1, therefore
//strobing $4016.d0 affects both controller port latches.
//$4017 bit 0 writes are ignored.
Mmio.prototype.w4016 = function(data) {
    this.cpu.sfc.input.port1.latch(data & 1);
    this.cpu.sfc.input.port2.latch(data & 1);
}

//JOYSER0
//7-2 = MDR
//1-0 = Joypad serial data
Mmio.prototype.r4016 = function() {
    var r = this.cpu.regs.mdr & 0xfc;
    r |= this.cpu.sfc.input.port1.data();
    return r;
}

//JOYSER1
//7-5 = MDR
//4-2 = Always 1 (pins are connected to GND)
//1-0 = Joypad serial data
Mmio.prototype.r4017 = function() {
    var r = (this.cpu.regs.mdr & 0xe0) | 0x1c;
    r |= this.cpu.sfc.input.port2.data();
    return r;
}

//NMITIMEN
Mmio.prototype.w4200 = function(data) {
    this.cpu.status.auto_joypad_poll = data & 1;
    nmitimen_update(data);
}

//WRIO
Mmio.prototype.w4201 = function(data) {
    if((this.cpu.status.pio & 0x80) && !(data & 0x80))
        this.cpu.sfc.ppu.latch_counters();

    this.cpu.status.pio = data;
}

//WRMPYA
Mmio.prototype.w4202 = function(data) {
    this.cpu.status.wrmpya = data;
}

//WRMPYB
Mmio.prototype.w4203 = function(data) {
    this.cpu.status.rdmpy = 0;
    if(this.cpu.alu.mpyctr || this.cpu.alu.divctr) return;

    this.cpu.status.wrmpyb = data;
    this.cpu.status.rddiv = (this.cpu.status.wrmpyb << 8) | this.cpu.status.wrmpya;

    this.cpu.alu.mpyctr = 8;  //perform multiplication over the next eight cycles
    this.cpu.alu.shift = this.cpu.status.wrmpyb;
}

//WRDIVL
Mmio.prototype.w4204 = function(data) {
    this.cpu.status.wrdiva = (this.cpu.status.wrdiva & 0xff00) | (data << 0);
}

//WRDIVH
Mmio.prototype.w4205 = function(data) {
    this.cpu.status.wrdiva = (this.cpu.status.wrdiva & 0x00ff) | (data << 8);
}

//WRDIVB
Mmio.prototype.w4206 = function(data) {
    this.cpu.status.rdmpy = this.cpu.status.wrdiva;
    if(this.cpu.alu.mpyctr || this.cpu.alu.divctr) return;

    this.cpu.status.wrdivb = data;

    this.cpu.alu.divctr = 16;  //perform division over the next sixteen cycles
    this.cpu.alu.shift = this.cpu.status.wrdivb << 16;
}

//HTIMEL
Mmio.prototype.w4207 = function(data) {
    this.cpu.status.hirq_pos = (this.cpu.status.hirq_pos & 0x0100) | (data << 0);
}

//HTIMEH
Mmio.prototype.w4208 = function(data) {
    this.cpu.status.hirq_pos = (this.cpu.status.hirq_pos & 0x00ff) | (data << 8);
}

//VTIMEL
Mmio.prototype.mmio_w4209 = function(data) {
    this.cpu.status.virq_pos = (this.cpu.status.virq_pos & 0x0100) | (data << 0);
}

//VTIMEH
Mmio.prototype.w420a = function(data) {
    this.cpu.status.virq_pos = (this.cpu.status.virq_pos & 0x00ff) | (data << 8);
}

//DMAEN
Mmio.prototype.w420b = function(data) {
    for(var i = 0; i < 8; i++) {
        this.cpu.dma.channel[i].dma_enabled = data & (1 << i);
    }
    if(data) this.cpu.status.dma_pending = true;
}

//HDMAEN
Mmio.prototype.w420c = function(data) {
    for(var i = 0; i < 8; i++) {
        this.cpu.dma.channel[i].hdma_enabled = data & (1 << i);
    }
}

//MEMSEL
Mmio.prototype.w420d = function(data) {
    this.cpu.status.rom_speed = (data & 1 ? 6 : 8);
}

//RDNMI
//7   = NMI acknowledge
//6-4 = MDR
//3-0 = CPU (5a22) version
Mmio.prototype.r4210 = function() {
    var r = (this.cpu.regs.mdr & 0x70);
    r |= (this.cpu.timing.rdnmi()) << 7;
    r |= (this.cpu.cpu_version & 0x0f);
    return r;
}

//TIMEUP
//7   = IRQ acknowledge
//6-0 = MDR
Mmio.prototype.r4211 = function() {
    var r = (this.cpu.regs.mdr & 0x7f);
    r |= (this.cpu.timing.timeup()) << 7;
    return r;
}

//HVBJOY
//7   = VBLANK acknowledge
//6   = HBLANK acknowledge
//5-1 = MDR
//0   = JOYPAD acknowledge
Mmio.prototype.r4212 = function() {
    var r = (this.cpu.regs.mdr & 0x3e);
    if(this.cpu.status.auto_joypad_active) r |= 0x01;
    if(hcounter() <= 2 || hcounter() >= 1096) r |= 0x40;  //hblank
    if(vcounter() >= (this.cpu.sfc.ppu.overscan() == false ? 225 : 240)) r |= 0x80;  //vblank
    return r;
}

//RDIO
Mmio.prototype.r4213 = function() {
    return this.cpu.status.pio;
}

//RDDIVL
Mmio.prototype.r4214 = function() {
    return this.cpu.status.rddiv >> 0;
}

//RDDIVH
Mmio.prototype.r4215 = function() {
    return this.cpu.status.rddiv >> 8;
}

//RDMPYL
Mmio.prototype.r4216 = function() {
    return this.cpu.status.rdmpy >> 0;
}

//RDMPYH
Mmio.prototype.r4217 = function() {
    return this.cpu.status.rdmpy >> 8;
}

Mmio.prototype.r4218 = function() { return this.cpu.status.joy1 >> 0; }  //JOY1L
Mmio.prototype.r4219 = function() { return this.cpu.status.joy1 >> 8; }  //JOY1H
Mmio.prototype.r421a = function() { return this.cpu.status.joy2 >> 0; }  //JOY2L
Mmio.prototype.r421b = function() { return this.cpu.status.joy2 >> 8; }  //JOY2H
Mmio.prototype.r421c = function() { return this.cpu.status.joy3 >> 0; }  //JOY3L
Mmio.prototype.r421d = function() { return this.cpu.status.joy3 >> 8; }  //JOY3H
Mmio.prototype.r421e = function() { return this.cpu.status.joy4 >> 0; }  //JOY4L
Mmio.prototype.r421f = function() { return this.cpu.status.joy4 >> 8; }  //JOY4H

//DMAPx
Mmio.prototype.r43x0 = function(i) {
    return (this.cpu.dma.channel[i].direction << 7)
             | (this.cpu.dma.channel[i].indirect << 6)
             | (this.cpu.dma.channel[i].unused << 5)
             | (this.cpu.dma.channel[i].reverse_transfer << 4)
             | (this.cpu.dma.channel[i].fixed_transfer << 3)
             | (this.cpu.dma.channel[i].transfer_mode << 0);
}

//BBADx
Mmio.prototype.r43x1 = function(i) {
    return this.cpu.dma.channel[i].dest_addr;
}

//A1TxL
Mmio.prototype.r43x2 = function(i) {
    return this.cpu.dma.channel[i].source_addr >> 0;
}

//A1TxH
Mmio.prototype.r43x3 = function(i) {
    return this.cpu.dma.channel[i].source_addr >> 8;
}

//A1Bx
Mmio.prototype.r43x4 = function(i) {
    return this.cpu.dma.channel[i].source_bank;
}

//DASxL
//union { uint16 transfer_size; uint16 indirect_addr; };
Mmio.prototype.r43x5 = function(i) {
    return this.cpu.dma.channel[i].transfer_size >> 0;
}

//DASxH
//union { uint16 transfer_size; uint16 indirect_addr; };
Mmio.prototype.r43x6 = function(i) {
    return this.cpu.dma.channel[i].transfer_size >> 8;
}

//DASBx
Mmio.prototype.r43x7 = function(i) {
    return this.cpu.dma.channel[i].indirect_bank;
}

//A2AxL
Mmio.prototype.r43x8 = function(i) {
    return this.cpu.dma.channel[i].hdma_addr >> 0;
}

//A2AxH
Mmio.prototype.r43x9 = function(i) {
    return this.cpu.dma.channel[i].hdma_addr >> 8;
}

//NTRLx
Mmio.prototype.r43xa = function(i) {
    return this.cpu.dma.channel[i].line_counter;
}

//???
Mmio.prototype.r43xb = function(i) {
    return this.cpu.dma.channel[i].unknown;
}

//DMAPx
Mmio.prototype.w43x0 = function(i, data) {
    this.cpu.dma.channel[i].direction = data & 0x80;
    this.cpu.dma.channel[i].indirect = data & 0x40;
    this.cpu.dma.channel[i].unused = data & 0x20;
    this.cpu.dma.channel[i].reverse_transfer = data & 0x10;
    this.cpu.dma.channel[i].fixed_transfer = data & 0x08;
    this.cpu.dma.channel[i].transfer_mode = data & 0x07;
}

//DDBADx
Mmio.prototype.w43x1 = function(i, data) {
    this.cpu.dma.channel[i].dest_addr = data;
}

//A1TxL
Mmio.prototype.w43x2 = function(i, data) {
    this.cpu.dma.channel[i].source_addr = (this.cpu.dma.channel[i].source_addr & 0xff00) | (data << 0);
}

//A1TxH
Mmio.prototype.w43x3 = function(i, data) {
    this.cpu.dma.channel[i].source_addr = (this.cpu.dma.channel[i].source_addr & 0x00ff) | (data << 8);
}

//A1Bx
Mmio.prototype.w43x4 = function(i, data) {
    this.cpu.dma.channel[i].source_bank = data;
}

//DASxL
//union { uint16 transfer_size; uint16 indirect_addr; };
Mmio.prototype.w43x5 = function(i, data) {
    this.cpu.dma.channel[i].transfer_size = (this.cpu.dma.channel[i].transfer_size & 0xff00) | (data << 0);
}

//DASxH
//union { uint16 transfer_size; uint16 indirect_addr; };
Mmio.prototype.w43x6 = function(i, data) {
    this.cpu.dma.channel[i].transfer_size = (this.cpu.dma.channel[i].transfer_size & 0x00ff) | (data << 8);
}

//DASBx
Mmio.prototype.w43x7 = function(i, data) {
    this.cpu.dma.channel[i].indirect_bank = data;
}

//A2AxL
Mmio.prototype.w43x8 = function(i, data) {
    this.cpu.dma.channel[i].hdma_addr = (this.cpu.dma.channel[i].hdma_addr & 0xff00) | (data << 0);
}

//A2AxH
Mmio.prototype.w43x9 = function(i, data) {
    this.cpu.dma.channel[i].hdma_addr = (this.cpu.dma.channel[i].hdma_addr & 0x00ff) | (data << 8);
}

//NTRLx
Mmio.prototype.w43xa = function(i, data) {
    this.cpu.dma.channel[i].line_counter = data;
}

//???
Mmio.prototype.w43xb = function(i, data) {
    this.cpu.dma.channel[i].unknown = data;
}

Mmio.prototype.power = function() {
}

Mmio.prototype.reset = function() {
    //$2140-217f
    for(var i = 0; i < this.cpu.status.port.length; ++i)
        this.cpu.status.port[i] = 0x00;

    //$2181-$2183
    this.cpu.status.wram_addr = 0x000000;

    //$4016-$4017
    this.cpu.status.joypad_strobe_latch = 0;
    this.cpu.status.joypad1_bits = ~0;
    this.cpu.status.joypad2_bits = ~0;

    //$4200
    this.cpu.status.nmi_enabled = false;
    this.cpu.status.hirq_enabled = false;
    this.cpu.status.virq_enabled = false;
    this.cpu.status.auto_joypad_poll = false;

    //$4201
    this.cpu.status.pio = 0xff;

    //$4202-$4203
    this.cpu.status.wrmpya = 0xff;
    this.cpu.status.wrmpyb = 0xff;

    //$4204-$4206
    this.cpu.status.wrdiva = 0xffff;
    this.cpu.status.wrdivb = 0xff;

    //$4207-$420a
    this.cpu.status.hirq_pos = 0x01ff;
    this.cpu.status.virq_pos = 0x01ff;

    //$420d
    this.cpu.status.rom_speed = 8;

    //$4214-$4217
    this.cpu.status.rddiv = 0x0000;
    this.cpu.status.rdmpy = 0x0000;

    //$4218-$421f
    this.cpu.status.joy1 = 0x0000;
    this.cpu.status.joy2 = 0x0000;
    this.cpu.status.joy3 = 0x0000;
    this.cpu.status.joy4 = 0x0000;

    //ALU
    this.cpu.alu.mpyctr = 0;
    this.cpu.alu.divctr = 0;
    this.cpu.alu.shift = 0;
}

Mmio.prototype.read = function(unsigned addr) {
    addr &= 0xffff;

    //APU
    if((addr & 0xffc0) == 0x2140) {  //$2140-$217f
        synchronize_smp();
        return smp.port_read(addr);
    }

    //DMA
    if((addr & 0xff80) == 0x4300) {  //$4300-$437f
        unsigned i = (addr >> 4) & 7;
        switch(addr & 0xf) {
        case 0x0: return mmio_r43x0(i);
        case 0x1: return mmio_r43x1(i);
        case 0x2: return mmio_r43x2(i);
        case 0x3: return mmio_r43x3(i);
        case 0x4: return mmio_r43x4(i);
        case 0x5: return mmio_r43x5(i);
        case 0x6: return mmio_r43x6(i);
        case 0x7: return mmio_r43x7(i);
        case 0x8: return mmio_r43x8(i);
        case 0x9: return mmio_r43x9(i);
        case 0xa: return mmio_r43xa(i);
        case 0xb: return mmio_r43xb(i);
        case 0xc: return regs.mdr;  //unmapped
        case 0xd: return regs.mdr;  //unmapped
        case 0xe: return regs.mdr;  //unmapped
        case 0xf: return mmio_r43xb(i);  //mirror of $43xb
        }
    }

    switch(addr) {
    case 0x2180: return mmio_r2180();
    case 0x4016: return mmio_r4016();
    case 0x4017: return mmio_r4017();
    case 0x4210: return mmio_r4210();
    case 0x4211: return mmio_r4211();
    case 0x4212: return mmio_r4212();
    case 0x4213: return mmio_r4213();
    case 0x4214: return mmio_r4214();
    case 0x4215: return mmio_r4215();
    case 0x4216: return mmio_r4216();
    case 0x4217: return mmio_r4217();
    case 0x4218: return mmio_r4218();
    case 0x4219: return mmio_r4219();
    case 0x421a: return mmio_r421a();
    case 0x421b: return mmio_r421b();
    case 0x421c: return mmio_r421c();
    case 0x421d: return mmio_r421d();
    case 0x421e: return mmio_r421e();
    case 0x421f: return mmio_r421f();
    }

    return regs.mdr;
}

Mmio.prototype.write = function(unsigned addr, uint8 data) {
    addr &= 0xffff;

    //APU
    if((addr & 0xffc0) == 0x2140) {  //$2140-$217f
        synchronize_smp();
        port_write(addr, data);
        return;
    }

    //DMA
    if((addr & 0xff80) == 0x4300) {  //$4300-$437f
        unsigned i = (addr >> 4) & 7;
        switch(addr & 0xf) {
            case 0x0: mmio_w43x0(i, data); return;
            case 0x1: mmio_w43x1(i, data); return;
            case 0x2: mmio_w43x2(i, data); return;
            case 0x3: mmio_w43x3(i, data); return;
            case 0x4: mmio_w43x4(i, data); return;
            case 0x5: mmio_w43x5(i, data); return;
            case 0x6: mmio_w43x6(i, data); return;
            case 0x7: mmio_w43x7(i, data); return;
            case 0x8: mmio_w43x8(i, data); return;
            case 0x9: mmio_w43x9(i, data); return;
            case 0xa: mmio_w43xa(i, data); return;
            case 0xb: mmio_w43xb(i, data); return;
            case 0xc: return;  //unmapped
            case 0xd: return;  //unmapped
            case 0xe: return;  //unmapped
            case 0xf: mmio_w43xb(i, data); return;  //mirror of $43xb
        }
    }

    switch(addr) {
        case 0x2180: mmio_w2180(data); return;
        case 0x2181: mmio_w2181(data); return;
        case 0x2182: mmio_w2182(data); return;
        case 0x2183: mmio_w2183(data); return;
        case 0x4016: mmio_w4016(data); return;
        case 0x4017: return;  //unmapped
        case 0x4200: mmio_w4200(data); return;
        case 0x4201: mmio_w4201(data); return;
        case 0x4202: mmio_w4202(data); return;
        case 0x4203: mmio_w4203(data); return;
        case 0x4204: mmio_w4204(data); return;
        case 0x4205: mmio_w4205(data); return;
        case 0x4206: mmio_w4206(data); return;
        case 0x4207: mmio_w4207(data); return;
        case 0x4208: mmio_w4208(data); return;
        case 0x4209: mmio_w4209(data); return;
        case 0x420a: mmio_w420a(data); return;
        case 0x420b: mmio_w420b(data); return;
        case 0x420c: mmio_w420c(data); return;
        case 0x420d: mmio_w420d(data); return;
    }
}