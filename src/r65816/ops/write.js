//require last_cycle()
//require op_* (memory ops)

module.exports = {
    write_addr_b: function(n) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        last_cycle();
        op_writedbr(this.aa.w, this.regs[n]);
    },

    write_addr_w: function(n) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_writedbr(this.aa.w + 0, this.regs[n] >> 0);
        last_cycle();
        op_writedbr(this.aa.w + 1, this.regs[n] >> 8);
    },

    write_addrr_b: function(n, i) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        last_cycle();
        op_writedbr(this.aa.w + this.regs[i], this.regs[n]);
    },

    write_addrr_w: function(n, i) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        op_writedbr(this.aa.w + this.regs[i] + 0, this.regs[n] >> 0);
        last_cycle();
        op_writedbr(this.aa.w + this.regs[i] + 1, this.regs[n] >> 8);
    },

    write_longr_b: function(i) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.aa.b = op_readpc();
        last_cycle();
        op_writelong(this.aa.d + this.regs[i], this.regs.a.l);
    },

    write_longr_w: function(i) {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.aa.b = op_readpc();
        op_writelong(this.aa.d + this.regs[i] + 0, this.regs.a.l);
        last_cycle();
        op_writelong(this.aa.d + this.regs[i] + 1, this.regs.a.h);
    },

    write_dp_b: function(n) {
        this.dp = op_readpc();
        op_io_cond2();
        last_cycle();
        op_writedp(dp, this.regs[n]);
    },

    write_dp_w: function(n) {
        this.dp = op_readpc();
        op_io_cond2();
        op_writedp(this.dp + 0, this.regs[n] >> 0);
        last_cycle();
        op_writedp(this.dp + 1, this.regs[n] >> 8);
    },

    write_dpr_b: function(n, i) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        last_cycle();
        op_writedp(this.dp + this.regs[i], this.regs[n]);
    },

    write_dpr_w: function(n, i) {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        op_writedp(this.dp + this.regs[i] + 0, this.regs[n] >> 0);
        last_cycle();
        op_writedp(this.dp + this.regs[i] + 1, this.regs[n] >> 8);
    },

    sta_idp_b: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        last_cycle();
        op_writedbr(this.aa.w, this.regs.a.l);
    },

    sta_idp_w: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        op_writedbr(this.aa.w + 0, this.regs.a.l);
        last_cycle();
        op_writedbr(this.aa.w + 1, this.regs.a.h);
    },

    sta_ildp_b: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        last_cycle();
        op_writelong(this.aa.d, this.regs.a.l);
    },

    sta_ildp_w: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        op_writelong(this.aa.d + 0, this.regs.a.l);
        last_cycle();
        op_writelong(this.aa.d + 1, this.regs.a.h);
    },

    sta_idpx_b: function() {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        this.aa.l = op_readdp(this.dp + this.regs.x.w + 0);
        this.aa.h = op_readdp(this.dp + this.regs.x.w + 1);
        last_cycle();
        op_writedbr(this.aa.w, this.regs.a.l);
    },

    sta_idpx_w: function() {
        this.dp = op_readpc();
        op_io_cond2();
        op_io();
        this.aa.l = op_readdp(this.dp + this.regs.x.w + 0);
        this.aa.h = op_readdp(this.dp + this.regs.x.w + 1);
        op_writedbr(this.aa.w + 0, this.regs.a.l);
        last_cycle();
        op_writedbr(this.aa.w + 1, this.regs.a.h);
    },

    sta_idpy_b: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        op_io();
        last_cycle();
        op_writedbr(this.aa.w + this.regs.y.w, this.regs.a.l);
    },

    sta_idpy_w: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        op_io();
        op_writedbr(this.aa.w + this.regs.y.w + 0, this.regs.a.l);
        last_cycle();
        op_writedbr(this.aa.w + this.regs.y.w + 1, this.regs.a.h);
    },

    sta_ildpy_b: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        last_cycle();
        op_writelong(this.aa.d + this.regs.y.w, this.regs.a.l);
    },

    sta_ildpy_w: function() {
        this.dp = op_readpc();
        op_io_cond2();
        this.aa.l = op_readdp(this.dp + 0);
        this.aa.h = op_readdp(this.dp + 1);
        this.aa.b = op_readdp(this.dp + 2);
        op_writelong(this.aa.d + this.regs.y.w + 0, this.regs.a.l);
        last_cycle();
        op_writelong(this.aa.d + this.regs.y.w + 1, this.regs.a.h);
    },

    sta_sr_b: function() {
        this.sp = op_readpc();
        op_io();
        last_cycle();
        op_writesp(this.sp, this.regs.a.l);
    },

    sta_sr_w: function() {
        this.sp = op_readpc();
        op_io();
        op_writesp(this.sp + 0, this.regs.a.l);
        last_cycle();
        op_writesp(this.sp + 1, this.regs.a.h);
    },

    sta_isry_b: function() {
        this.sp = op_readpc();
        op_io();
        this.aa.l = op_readsp(this.sp + 0);
        this.aa.h = op_readsp(this.sp + 1);
        op_io();
        last_cycle();
        op_writedbr(this.aa.w + this.regs.y.w, this.regs.a.l);
    },

    sta_isry_w: function() {
        this.sp = op_readpc();
        op_io();
        this.aa.l = op_readsp(this.sp + 0);
        this.aa.h = op_readsp(this.sp + 1);
        op_io();
        op_writedbr(this.aa.w + this.regs.y.w + 0, this.regs.a.l);
        last_cycle();
        op_writedbr(this.aa.w + this.regs.y.w + 1, this.regs.a.h);
    }
};
