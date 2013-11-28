//require last_cycle()
//require op_* (memory ops)

module.exports = {
    read_const_b: function(op) {
        last_cycle();
        this.rd.l = op_readpc();
        op.call(this);
    },

    read_const_w: function(op) {
        this.rd.l = op_readpc();
        last_cycle();
        this.rd.h = op_readpc();
        op.call(this);
    },

    read_bit_const_b: function() {
        last_cycle();
        this.rd.l = op_readpc();
        this.regs.p.z = ((this.rd.l & this.regs.a.l) == 0);
    },

    read_bit_const_w: function() {
        this.rd.l = op_readpc();
        last_cycle();
        this.rd.h = op_readpc();
        this.regs.p.z = ((this.rd.w & this.regs.a.w) == 0);
    },

    read_addr_b: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        last_cycle();
        this.rd.l = op_readdbr(this.aa.w);
        op.call(this);
    },

    read_addr_w: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.rd.l = op_readdbr(this.aa.w + 0);
        last_cycle();
        this.rd.h = op_readdbr(this.aa.w + 1);
        op.call(this);
    },

    read_addrx_b: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io_cond4(this.aa.w, this.aa.w + this.regs.x.w);
        last_cycle();
        this.rd.l = op_readdbr(this.aa.w + this.regs.x.w);
        op.call(this);
    },

    read_addrx_w: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io_cond4(this.aa.w, this.aa.w + this.regs.x.w);
        this.rd.l = op_readdbr(this.aa.w + this.regs.x.w + 0);
        last_cycle();
        this.rd.h = op_readdbr(this.aa.w + this.regs.x.w + 1);
        op.call(this);
    },

    read_addry_b: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io_cond4(this.aa.w, this.aa.w + this.regs.y.w);
        last_cycle();
        this.rd.l = op_readdbr(this.aa.w + this.regs.y.w);
        op.call(this);
    },

    read_addry_w: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io_cond4(this.aa.w, this.aa.w + this.regs.y.w);
        this.rd.l = op_readdbr(this.aa.w + this.regs.y.w + 0);
        last_cycle();
        this.rd.h = op_readdbr(this.aa.w + this.regs.y.w + 1);
        op.call(this);
    },

    read_long_b: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.aa.b = op_readpc();
        last_cycle();
        this.rd.l = op_readlong(this.aa.d);
        op.call(this);
    },

    read_long_w: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.aa.b = op_readpc();
        this.rd.l = op_readlong(this.aa.d + 0);
        last_cycle();
        this.rd.h = op_readlong(this.aa.d + 1);
        op.call(this);
    },

    read_longx_b: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.aa.b = op_readpc();
        last_cycle();
        this.rd.l = op_readlong(this.aa.d + this.regs.x.w);
        op.call(this);
    },

    read_longx_w: function(op) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.aa.b = op_readpc();
        this.rd.l = op_readlong(this.aa.d + this.regs.x.w + 0);
        last_cycle();
        this.rd.h = op_readlong(this.aa.d + this.regs.x.w + 1);
        op.call(this);
    },

    read_dp_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        last_cycle();
        this.rd.l = op_readdp(dp);
        op.call(this);
    },

    read_dp_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.rd.l = op_readdp(this.dp + 0);
        last_cycle();
        this.rd.h = op_readdp(this.dp + 1);
        op.call(this);
    },

    read_dpr_b: function(op, n) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        last_cycle();
        this.rd.l = op_readdp(this.dp + this.regs[n].w);
        op.call(this);
    },

    read_dpr_w: function(op, n) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        this.rd.l = op_readdp(this.dp + this.regs[n].w + 0);
        last_cycle();
        this.rd.h = op_readdp(this.dp + this.regs[n].w + 1);
        op.call(this);
    },

    read_idp_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        last_cycle();
        this.rd.l = op_readdbr(this.aa.w);
        op.call(this);
    },

    read_idp_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.rd.l = op_readdbr(this.aa.w + 0);
        last_cycle();
        this.rd.h = op_readdbr(this.aa.w + 1);
        op.call(this);
    },

    read_idpx_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        this.aa.l = op_readdp(this.dp + this.regs.x.w + 0);
        this.aa.h = op_readdp(this.dp + this.regs.x.w + 1);
        last_cycle();
        this.rd.l = op_readdbr(this.aa.w);
        op.call(this);
    },

    read_idpx_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        this.aa.l = op_readdp(this.dp + this.regs.x.w + 0);
        this.aa.h = op_readdp(this.dp + this.regs.x.w + 1);
        this.rd.l = op_readdbr(this.aa.w + 0);
        last_cycle();
        this.rd.h = op_readdbr(this.aa.w + 1);
        op.call(this);
    },

    read_idpy_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        op_io_cond4(this.aa.w, this.aa.w + this.regs.y.w);
        last_cycle();
        this.rd.l = op_readdbr(this.aa.w + this.regs.y.w);
        op.call(this);
    },

    read_idpy_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        op_io_cond4(this.aa.w, this.aa.w + this.regs.y.w);
        this.rd.l = op_readdbr(this.aa.w + this.regs.y.w + 0);
        last_cycle();
        this.rd.h = op_readdbr(this.aa.w + this.regs.y.w + 1);
        op.call(this);
    },

    read_ildp_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        last_cycle();
        this.rd.l = op_readlong(this.aa.d);
        op.call(this);
    },

    read_ildp_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        this.rd.l = op_readlong(this.aa.d + 0);
        last_cycle();
        this.rd.h = op_readlong(this.aa.d + 1);
        op.call(this);
    },

    read_ildpy_b: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        last_cycle();
        this.rd.l = op_readlong(this.aa.d + this.regs.y.w);
        op.call(this);
    },

    read_ildpy_w: function(op) {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        this.rd.l = op_readlong(this.aa.d + this.regs.y.w + 0);
        last_cycle();
        this.rd.h = op_readlong(this.aa.d + this.regs.y.w + 1);
        op.call(this);
    },

    read_sr_b: function(op) {
        this.sp = op_readpc();
        op_io();
        last_cycle();
        this.rd.l = op_readsp(sp);
        op.call(this);
    },

    read_sr_w: function(op) {
        this.sp = op_readpc();
        op_io();
        this.rd.l = op_readsp(this.sp + 0);
        last_cycle();
        this.rd.h = op_readsp(this.sp + 1);
        op.call(this);
    },

    read_isry_b: function(op) {
        this.sp = op_readpc();
        op_io();
        this.aa.l = op_readsp(this.sp + 0);
        this.aa.h = op_readsp(this.sp + 1);
        op_io();
        last_cycle();
        this.rd.l = op_readdbr(this.aa.w + this.regs.y.w);
        op.call(this);
    },

    read_isry_w: function(op) {
        this.sp = op_readpc();
        op_io();
        this.aa.l = op_readsp(this.sp + 0);
        this.aa.h = op_readsp(this.sp + 1);
        op_io();
        this.rd.l = op_readdbr(this.aa.w + this.regs.y.w + 0);
        last_cycle();
        this.rd.h = op_readdbr(this.aa.w + this.regs.y.w + 1);
        op.call(this);
    }
};
