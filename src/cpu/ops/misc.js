//require last_cycle()
//require op_* (memory ops)

module.exports = {
    nop: function() {
        last_cycle();
        op_io_irq();
    },

    wdm: function() {
        last_cycle();
        op_readpc();
    },

    xba: function() {
        op_io();
        last_cycle();
        op_io();
        this.regs.a.l ^= this.regs.a.h;
        this.regs.a.h ^= this.regs.a.l;
        this.regs.a.l ^= this.regs.a.h;
        this.regs.p.n = (this.regs.a.l & 0x80);
        this.regs.p.z = (this.regs.a.l == 0);
    },

    move_b: function(adjust) {
        this.dp = op_readpc();
        this.sp = op_readpc();
        this.regs.db = this.dp;
        this.rd.l = op_readlong((this.sp << 16) | this.regs.x.w);
        op_writelong((this.dp << 16) | this.regs.y.w, this.rd.l);
        op_io();
        this.regs.x.l += adjust;
        this.regs.y.l += adjust;
        last_cycle();
        op_io();
        if(this.regs.a.w--) this.regs.pc.w -= 3;
    },

    move_w: function(adjust) {
        this.dp = op_readpc();
        this.sp = op_readpc();
        this.regs.db = this.dp;
        this.rd.l = op_readlong((this.sp << 16) | this.regs.x.w);
        op_writelong((this.dp << 16) | this.regs.y.w, this.rd.l);
        op_io();
        this.regs.x.w += adjust;
        this.regs.y.w += adjust;
        last_cycle();
        op_io();
        if(this.regs.a.w--) this.regs.pc.w -= 3;
    },

    interrupt_e: function(vectorE, vectorN) {
        op_readpc();
        op_writestack(this.regs.pc.h);
        op_writestack(this.regs.pc.l);
        op_writestack(this.regs.p);
        this.rd.l = op_readlong(vectorE + 0);
        this.regs.pc.b = 0;
        this.regs.p.i = 1;
        this.regs.p.d = 0;
        last_cycle();
        this.rd.h = op_readlong(vectorE + 1);
        this.regs.pc.w = this.rd.w;
    },

    interrupt_n: function(vectorE, vectorN) {
        op_readpc();
        op_writestack(this.regs.pc.b);
        op_writestack(this.regs.pc.h);
        op_writestack(this.regs.pc.l);
        op_writestack(this.regs.p);
        this.rd.l = op_readlong(vectorN + 0);
        this.regs.pc.b = 0x00;
        this.regs.p.i = 1;
        this.regs.p.d = 0;
        last_cycle();
        this.rd.h = op_readlong(vectorN + 1);
        this.regs.pc.w = this.rd.w;
    },

    stp: function() {
        while(this.regs.wai = true) {
            last_cycle();
            op_io();
        }
    },

    wai: function() {
        this.regs.wai = true;
        while(this.regs.wai) {
            last_cycle();
            op_io();
        }
        op_io();
    },

    xce: function() {
        last_cycle();
        op_io_irq();
        var carry = !!this.regs.p.c;
        this.regs.p.c = this.regs.e;
        this.regs.e = carry;
        if(this.regs.e) {
            this.regs.p.value |= 0x30;
            this.regs.s.h = 0x01;
        }
        if(this.regs.p.x) {
            this.regs.x.h = 0x00;
            this.regs.y.h = 0x00;
        }
        this.updateTable();
    },

    flag: function(mask, value) {
        last_cycle();
        op_io_irq();
        this.regs.p.value = (this.regs.p.value & ~mask) | value;
    },

    pflag_e: function(mode) {
        this.rd.l = op_readpc();
        last_cycle();
        op_io();
        this.regs.p.value = (mode ? this.regs.p.value | this.rd.l : this.regs.p.value & ~this.rd.l);
        this.regs.p.value |= 0x30;
        if(this.regs.p.x) {
            this.regs.x.h = 0x00;
            this.regs.y.h = 0x00;
        }
        this.updateTable();
    },

    pflag_n: function(mode) {
        this.rd.l = op_readpc();
        last_cycle();
        op_io();
        this.regs.p.value = (mode ? this.regs.p.value | this.rd.l : this.regs.p.value & ~this.rd.l);
        if(this.regs.p.x) {
            this.regs.x.h = 0x00;
            this.regs.y.h = 0x00;
        }
        this.updateTable();
    },

    transfer_b: function(from, to) {
        last_cycle();
        op_io_irq();
        this.regs[to].l = this.regs[from].l;
        this.regs.p.n = (this.regs[to].l & 0x80);
        this.regs.p.z = (this.regs[to].l == 0);
    },

    transfer_w: function(from, to) {
        last_cycle();
        op_io_irq();
        this.regs[to].w = this.regs[from].w;
        this.regs.p.n = (this.regs[to].w & 0x8000);
        this.regs.p.z = (this.regs[to].w == 0);
    },

    tcs_e: function() {
        last_cycle();
        op_io_irq();
        this.regs.s.l = this.regs.a.l;
    },

    tcs_n: function() {
        last_cycle();
        op_io_irq();
        this.regs.s.w = this.regs.a.w;
    },

    tsx_b: function() {
        last_cycle();
        op_io_irq();
        this.regs.x.l = this.regs.s.l;
        this.regs.p.n = (this.regs.x.l & 0x80);
        this.regs.p.z = (this.regs.x.l == 0);
    },

    tsx_w: function() {
        last_cycle();
        op_io_irq();
        this.regs.x.w = this.regs.s.w;
        this.regs.p.n = (this.regs.x.w & 0x8000);
        this.regs.p.z = (this.regs.x.w == 0);
    },

    txs_e: function() {
        last_cycle();
        op_io_irq();
        this.regs.s.l = this.regs.x.l;
    },

    txs_n: function() {
        last_cycle();
        op_io_irq();
        this.regs.s.w = this.regs.x.w;
    },

    push_b: function(n) {
        op_io();
        last_cycle();
        op_writestack(this.regs[n].l);
    },

    push_w: function(n) {
        op_io();
        op_writestack(this.regs[n].h);
        last_cycle();
        op_writestack(this.regs[n].l);
    },

    phd_e: function() {
        op_io();
        op_writestackn(this.regs.d.h);
        last_cycle();
        op_writestackn(this.regs.d.l);
        this.regs.s.h = 0x01;
    },

    phd_n: function() {
        op_io();
        op_writestackn(this.regs.d.h);
        last_cycle();
        op_writestackn(this.regs.d.l);
    },

    phb: function() {
        op_io();
        last_cycle();
        op_writestack(this.regs.db);
    },

    phk: function() {
        op_io();
        last_cycle();
        op_writestack(this.regs.pc.b);
    },

    php: function() {
        op_io();
        last_cycle();
        op_writestack(this.regs.p);
    },

    pull_b: function(n) {
        op_io();
        op_io();
        last_cycle();
        this.regs[n].l = op_readstack();
        this.regs.p.n = (this.regs[n].l & 0x80);
        this.regs.p.z = (this.regs[n].l == 0);
    },

    pull_w: function(n) {
        op_io();
        op_io();
        this.regs[n].l = op_readstack();
        last_cycle();
        this.regs[n].h = op_readstack();
        this.regs.p.n = (this.regs[n].w & 0x8000);
        this.regs.p.z = (this.regs[n].w == 0);
    },

    pld_e: function() {
        op_io();
        op_io();
        this.regs.d.l = op_readstackn();
        last_cycle();
        this.regs.d.h = op_readstackn();
        this.regs.p.n = (this.regs.d.w & 0x8000);
        this.regs.p.z = (this.regs.d.w == 0);
        this.regs.s.h = 0x01;
    },

    pld_n: function() {
        op_io();
        op_io();
        this.regs.d.l = op_readstackn();
        last_cycle();
        this.regs.d.h = op_readstackn();
        this.regs.p.n = (this.regs.d.w & 0x8000);
        this.regs.p.z = (this.regs.d.w == 0);
    },

    plb: function() {
        op_io();
        op_io();
        last_cycle();
        this.regs.db = op_readstack();
        this.regs.p.n = (this.regs.db & 0x80);
        this.regs.p.z = (this.regs.db == 0);
    },

    plp_e: function() {
        op_io();
        op_io();
        last_cycle();
        this.regs.p.value = op_readstack() | 0x30;
        if(this.regs.p.x) {
            this.regs.x.h = 0x00;
            this.regs.y.h = 0x00;
        }
        this.updateTable();
    },

    plp_n: function() {
        op_io();
        op_io();
        last_cycle();
        this.regs.p.value = op_readstack();
        if(this.regs.p.x) {
            this.regs.x.h = 0x00;
            this.regs.y.h = 0x00;
        }
        this.updateTable();
    },

    pea_e: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_writestackn(this.aa.h);
        last_cycle();
        op_writestackn(this.aa.l);
        this.regs.s.h = 0x01;
    },

    pea_n: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_writestackn(this.aa.h);
        last_cycle();
        op_writestackn(this.aa.l);
    },

    pei_e: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        op_writestackn(this.aa.h);
        last_cycle();
        op_writestackn(this.aa.l);
        this.regs.s.h = 0x01;
    },

    pei_n: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        op_writestackn(this.aa.h);
        last_cycle();
        op_writestackn(this.aa.l);
    },

    per_e: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        this.rd.w = this.regs.pc.d + this.aa.w;
        op_writestackn(this.rd.h);
        last_cycle();
        op_writestackn(this.rd.l);
        this.regs.s.h = 0x01;
    },

    per_n: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        this.rd.w = this.regs.pc.d + this.aa.w;
        op_writestackn(this.rd.h);
        last_cycle();
        op_writestackn(this.rd.l);
    }
};
