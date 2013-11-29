module.exports = {
    readpc: function() {
        return op_read((this.regs.pc.b << 16) + this.regs.pc.w++);
    },

    readstack: function() {
        this.regs.e ? this.regs.s.l++ : this.regs.s.w++;
        return op_read(this.regs.s.w);
    },

    readstackn: function() {
        return op_read(++this.regs.s.w);
    },

    readaddr: function(addr) {
        return op_read(addr & 0xffff);
    },

    readlong: function(addr) {
        return op_read(addr & 0xffffff);
    },

    readdbr: function(addr) {
        return op_read(((this.regs.db << 16) + addr) & 0xffffff);
    },

    readpbr: function(addr) {
        return op_read((this.regs.pc.b << 16) + (addr & 0xffff));
    },

    readdp: function(addr) {
        if(this.regs.e && this.regs.d.l == 0x00) {
            return op_read((this.regs.d & 0xff00) + ((this.regs.d + (addr & 0xffff)) & 0xff));
        } else {
            return op_read((this.regs.d + (addr & 0xffff)) & 0xffff);
        }
    },

    readsp: function(addr) {
        return op_read((this.regs.s + (addr & 0xffff)) & 0xffff);
    },

    writestack: function(data) {
        op_write(this.regs.s.w, data);
        this.regs.e ? this.regs.s.l-- : this.regs.s.w--;
    },

    writestackn: function(data) {
        op_write(this.regs.s.w--, data);
    },

    writeaddr: function(addr, data) {
        op_write(addr & 0xffff, data);
    },

    writelong: function(addr, data) {
        op_write(addr & 0xffffff, data);
    },

    writedbr: function(addr, data) {
        op_write(((this.regs.db << 16) + addr) & 0xffffff, data);
    },

    writepbr: function(addr, data) {
        op_write((this.regs.pc.b << 16) + (addr & 0xffff), data);
    },

    writedp: function(addr, data) {
        if(this.regs.e && this.regs.d.l == 0x00) {
            op_write((this.regs.d & 0xff00) + ((this.regs.d + (addr & 0xffff)) & 0xff), data);
        } else {
            op_write((this.regs.d + (addr & 0xffff)) & 0xffff, data);
        }
    },

    writesp: function(addr, data) {
        op_write((this.regs.s + (addr & 0xffff)) & 0xffff, data);
    }
};