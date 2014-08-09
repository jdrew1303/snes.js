function CpuStatus(cpu) {
    this.cpu = cpu;

    this.interrupt_pending = false; //bool

    this.clock_count = 0; //unsigned
    this.line_clocks = 0; //unsigned

    //timing
    this.irq_lock = false; //bool

    this.dram_refresh_position = 0; //unsigned
    this.dram_refreshed = false; //bool

    this.hdma_init_position = 0; //unsigned
    this.hdma_init_triggered = false; //bool

    this.hdma_position = 0; //unsigned
    this.hdma_triggered = false; //bool

    this.nmi_valid = false; //bool
    this.nmi_line = false; //bool
    this.nmi_transition = false; //bool
    this.nmi_pending = false; //bool
    this.nmi_hold = false; //bool

    this.irq_valid = false; //bool
    this.irq_line = false; //bool
    this.irq_transition = false; //bool
    this.irq_pending = false; //bool
    this.irq_hold = false; //bool

    this.reset_pending = false; //bool

    //DMA
    this.dma_active = false; //bool
    this.dma_counter = 0; //unsigned
    this.dma_clocks = 0; //unsigned
    this.dma_pending = false; //bool
    this.hdma_pending = false; //bool
    this.hdma_mode = false; //bool  //0 = init, 1 = run

    //auto joypad polling
    this.auto_joypad_active = false; //bool
    this.auto_joypad_latch = false; //bool
    this.auto_joypad_counter = 0; //unsigned
    this.auto_joypad_clock = 0; //unsigned

    //MMIO
    //$2140-217f
    this.port = new Uint8Array(4), //uint8 [4]

    //$2181-$2183
    this.wram_addr = 0; //uint17

    //$4016-$4017
    this.joypad_strobe_latch = false; //bool
    this.joypad1_bits = 0; //uint32
    this.joypad2_bits = 0; //uint32

    //$4200
    this.nmi_enabled = false; //bool
    this.hirq_enabled = false; //bool
    this.virq_enabled = false; //bool
    this.auto_joypad_poll = false; //bool

    //$4201
    this.pio = 0; //uint8

    //$4202-$4203
    this.wrmpya = 0; //uint8
    this.wrmpyb = 0; //uint8

    //$4204-$4206
    this.wrdiva = 0; //uint16
    this.wrdivb = 0; //uint8

    //$4207-$420a
    this.hirq_pos = 0; //uint9
    this.virq_pos = 0; //uint9

    //$420d
    this.rom_speed = 0; //unsigned

    //$4214-$4217
    this.rddiv = 0; //uint16
    this.rdmpy = 0; //uint16

    //$4218-$421f
    this.joy1 = 0; //uint16
    this.joy2 = 0; //uint16
    this.joy3 = 0; //uint16
    this.joy4 = 0; //uint16
}

CpuStatus.prototype.constructor = CpuStatus;

module.exports = CpuStatus;
