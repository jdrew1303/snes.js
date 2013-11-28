//require last_cycle()
//require op_* (memory ops)

module.exports = {
    adjust_imm_b: function(n, adjust) {
        last_cycle();
        op_io_irq();
        this.regs[n].l += adjust;
        this.regs.p.n = (this.regs[n].l & 0x80);
        this.regs.p.z = (this.regs[n].l == 0);
    },

    adjust_imm_w: function(n, adjust) {
        last_cycle();
        op_io_irq();
        this.regs[n].w += adjust;
        this.regs.p.n = (this.regs[n].w & 0x8000);
        this.regs.p.z = (this.regs[n].w == 0);
    },

    asl_imm_b: function() {
        last_cycle();
        op_io_irq();
        this.regs.p.c = (this.regs.a.l & 0x80);
        this.regs.a.l <<= 1;
        this.regs.p.n = (this.regs.a.l & 0x80);
        this.regs.p.z = (this.regs.a.l == 0);
    },

    asl_imm_w: function() {
        last_cycle();
        op_io_irq();
        this.regs.p.c = (this.regs.a.w & 0x8000);
        this.regs.a.w <<= 1;
        this.regs.p.n = (this.regs.a.w & 0x8000);
        this.regs.p.z = (this.regs.a.w == 0);
    },

    lsr_imm_b: function() {
        last_cycle();
        op_io_irq();
        this.regs.p.c = (this.regs.a.l & 0x01);
        this.regs.a.l >>= 1;
        this.regs.p.n = (this.regs.a.l & 0x80);
        this.regs.p.z = (this.regs.a.l == 0);
    },

    lsr_imm_w: function() {
        last_cycle();
        op_io_irq();
        this.regs.p.c = (this.regs.a.w & 0x0001);
        this.regs.a.w >>= 1;
        this.regs.p.n = (this.regs.a.w & 0x8000);
        this.regs.p.z = (this.regs.a.w == 0);
    },

    rol_imm_b: function() {
        last_cycle();
        op_io_irq();
        bool carry = this.regs.p.c;
        this.regs.p.c = (this.regs.a.l & 0x80);
        this.regs.a.l = (this.regs.a.l << 1) | carry;
        this.regs.p.n = (this.regs.a.l & 0x80);
        this.regs.p.z = (this.regs.a.l == 0);
    },

    rol_imm_w: function() {
        last_cycle();
        op_io_irq();
        bool carry = this.regs.p.c;
        this.regs.p.c = (this.regs.a.w & 0x8000);
        this.regs.a.w = (this.regs.a.w << 1) | carry;
        this.regs.p.n = (this.regs.a.w & 0x8000);
        this.regs.p.z = (this.regs.a.w == 0);
    },

    ror_imm_b: function() {
        last_cycle();
        op_io_irq();
        bool carry = this.regs.p.c;
        this.regs.p.c = (this.regs.a.l & 0x01);
        this.regs.a.l = (carry << 7) | (this.regs.a.l >> 1);
        this.regs.p.n = (this.regs.a.l & 0x80);
        this.regs.p.z = (this.regs.a.l == 0);
    },

    ror_imm_w: function() {
        last_cycle();
        op_io_irq();
        bool carry = this.regs.p.c;
        this.regs.p.c = (this.regs.a.w & 0x0001);
        this.regs.a.w = (carry << 15) | (this.regs.a.w >> 1);
        this.regs.p.n = (this.regs.a.w & 0x8000);
        this.regs.p.z = (this.regs.a.w == 0);
    },

    adjust_addr_b: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.rd.l = op_readdbr(this.aa.w);
        op_io();
        op.call(this);
        last_cycle();
        op_writedbr(this.aa.w, this.rd.l);
    },

    adjust_addr_w: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.rd.l = op_readdbr(this.aa.w + 0);
        this.rd.h = op_readdbr(this.aa.w + 1);
        op_io();
        op.call(this);
        op_writedbr(this.aa.w + 1, this.rd.h);
        last_cycle();
        op_writedbr(this.aa.w + 0, this.rd.l);
    },

    adjust_addrx_b: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        this.rd.l = op_readdbr(this.aa.w + this.regs.x.w);
        op_io();
        op.call(this);
        last_cycle();
        op_writedbr(this.aa.w + this.regs.x.w, this.rd.l);
    },

    adjust_addrx_w: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        this.rd.l = op_readdbr(this.aa.w + this.regs.x.w + 0);
        this.rd.h = op_readdbr(this.aa.w + this.regs.x.w + 1);
        op_io();
        op.call(this);
        op_writedbr(this.aa.w + this.regs.x.w + 1, this.rd.h);
        last_cycle();
        op_writedbr(this.aa.w + this.regs.x.w + 0, this.rd.l);
    },

    adjust_dp_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.rd.l = op_readdp(dp);
        op_io();
        op.call(this);
        last_cycle();
        op_writedp(dp, this.rd.l);
    },

    adjust_dp_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.rd.l = op_readdp(this.dp + 0);
        this.rd.h = op_readdp(this.dp + 1);
        op_io();
        op.call(this);
        op_writedp(this.dp + 1, this.rd.h);
        last_cycle();
        op_writedp(this.dp + 0, this.rd.l);
    },

    adjust_dpx_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        this.rd.l = op_readdp(this.dp + this.regs.x.w);
        op_io();
        op.call(this);
        last_cycle();
        op_writedp(this.dp + this.regs.x.w, this.rd.l);
    },

    adjust_dpx_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        this.rd.l = op_readdp(this.dp + this.regs.x.w + 0);
        this.rd.h = op_readdp(this.dp + this.regs.x.w + 1);
        op_io();
        op.call(this);
        op_writedp(this.dp + this.regs.x.w + 1, this.rd.h);
        last_cycle();
        op_writedp(this.dp + this.regs.x.w + 0, this.rd.l);
    }
};
