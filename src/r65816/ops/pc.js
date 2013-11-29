//require last_cycle()
//require op_* (memory ops)

module.exports = {
    op_branch: function(bit, val) {
        if(!!(this.regs.p.value & bit) != val) {
            last_cycle();
            this.rd.l = op_readpc();
        } else {
            this.rd.l = op_readpc();
            this.aa.w = this.regs.pc.d + this.rd.l;
            op_io_cond6(this.aa.w);
            last_cycle();
            op_io();
            this.regs.pc.w = this.aa.w;
        }
    },

    op_bra: function() {
        this.rd.l = op_readpc();
        this.aa.w = this.regs.pc.d + this.rd.l;
        op_io_cond6(this.aa.w);
        last_cycle();
        op_io();
        this.regs.pc.w = this.aa.w;
    },

    op_brl: function() {
        this.rd.l = op_readpc();
        this.rd.h = op_readpc();
        last_cycle();
        op_io();
        this.regs.pc.w = this.regs.pc.d + this.rd.w;
    },

    op_jmp_addr: function() {
        this.rd.l = op_readpc();
        last_cycle();
        this.rd.h = op_readpc();
        this.regs.pc.w = this.rd.w;
    },

    op_jmp_long: function() {
        this.rd.l = op_readpc();
        this.rd.h = op_readpc();
        last_cycle();
        this.rd.b = op_readpc();
        this.regs.pc.d = this.rd.d & 0xffffff;
    },

    op_jmp_iaddr: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.rd.l = op_readaddr(this.aa.w + 0);
        last_cycle();
        this.rd.h = op_readaddr(this.aa.w + 1);
        this.regs.pc.w = this.rd.w;
    },

    op_jmp_iaddrx: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        this.rd.l = op_readpbr(this.aa.w + this.regs.x.w + 0);
        last_cycle();
        this.rd.h = op_readpbr(this.aa.w + this.regs.x.w + 1);
        this.regs.pc.w = this.rd.w;
    },

    op_jmp_iladdr: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        this.rd.l = op_readaddr(this.aa.w + 0);
        this.rd.h = op_readaddr(this.aa.w + 1);
        last_cycle();
        this.rd.b = op_readaddr(this.aa.w + 2);
        this.regs.pc.d = this.rd.d & 0xffffff;
    },

    op_jsr_addr: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_io();
        this.regs.pc.w--;
        op_writestack(this.regs.pc.h);
        last_cycle();
        op_writestack(this.regs.pc.l);
        this.regs.pc.w = this.aa.w;
    },

    op_jsr_long_e: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_writestackn(this.regs.pc.b);
        op_io();
        this.aa.b = op_readpc();
        this.regs.pc.w--;
        op_writestackn(this.regs.pc.h);
        last_cycle();
        op_writestackn(this.regs.pc.l);
        this.regs.pc.d = this.aa.d & 0xffffff;
        this.regs.s.h = 0x01;
    },

    op_jsr_long_n: function() {
        this.aa.l = op_readpc();
        this.aa.h = op_readpc();
        op_writestackn(this.regs.pc.b);
        op_io();
        this.aa.b = op_readpc();
        this.regs.pc.w--;
        op_writestackn(this.regs.pc.h);
        last_cycle();
        op_writestackn(this.regs.pc.l);
        this.regs.pc.d = this.aa.d & 0xffffff;
    },

    op_jsr_iaddrx_e: function() {
        this.aa.l = op_readpc();
        op_writestackn(this.regs.pc.h);
        op_writestackn(this.regs.pc.l);
        this.aa.h = op_readpc();
        op_io();
        this.rd.l = op_readpbr(this.aa.w + this.regs.x.w + 0);
        last_cycle();
        this.rd.h = op_readpbr(this.aa.w + this.regs.x.w + 1);
        this.regs.pc.w = this.rd.w;
        this.regs.s.h = 0x01;
    },

    op_jsr_iaddrx_n: function() {
        this.aa.l = op_readpc();
        op_writestackn(this.regs.pc.h);
        op_writestackn(this.regs.pc.l);
        this.aa.h = op_readpc();
        op_io();
        this.rd.l = op_readpbr(this.aa.w + this.regs.x.w + 0);
        last_cycle();
        this.rd.h = op_readpbr(this.aa.w + this.regs.x.w + 1);
        this.regs.pc.w = this.rd.w;
    },

    op_rti_e: function() {
        op_io();
        op_io();
        this.regs.p.value = op_readstack() | 0x30;
        this.rd.l = op_readstack();
        last_cycle();
        this.rd.h = op_readstack();
        this.regs.pc.w = this.rd.w;
    },

    op_rti_n: function() {
        op_io();
        op_io();
        this.regs.p.value = op_readstack();
        if(this.regs.p.x) {
            this.regs.x.h = 0x00;
            this.regs.y.h = 0x00;
        }
        this.rd.l = op_readstack();
        this.rd.h = op_readstack();
        last_cycle();
        this.rd.b = op_readstack();
        this.regs.pc.d = this.rd.d & 0xffffff;
        this.updateTable();
    },

    op_rts: function() {
        op_io();
        op_io();
        this.rd.l = op_readstack();
        this.rd.h = op_readstack();
        last_cycle();
        op_io();
        this.regs.pc.w = ++this.rd.w;
    },

    op_rtl_e: function() {
        op_io();
        op_io();
        this.rd.l = op_readstackn();
        this.rd.h = op_readstackn();
        last_cycle();
        this.rd.b = op_readstackn();
        this.regs.pc.b = this.rd.b;
        this.regs.pc.w = ++this.rd.w;
        this.regs.s.h = 0x01;
    },

    op_rtl_n: function() {
        op_io();
        op_io();
        this.rd.l = op_readstackn();
        this.rd.h = op_readstackn();
        last_cycle();
        this.rd.b = op_readstackn();
        this.regs.pc.b = this.rd.b;
        this.regs.pc.w = ++this.rd.w;
    }
};
