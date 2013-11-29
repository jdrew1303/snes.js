module.exports = {
    adc_b: function() {
        var result;

        if(!this.regs.p.d) {
            result = this.regs.a.l + this.rd.l + this.regs.p.c;
        } else {
            result = (this.regs.a.l & 0x0f) + (this.rd.l & 0x0f) + (this.regs.p.c << 0);
            if(result > 0x09) result += 0x06;
            this.regs.p.c = result > 0x0f;
            result = (this.regs.a.l & 0xf0) + (this.rd.l & 0xf0) + (this.regs.p.c << 4) + (result & 0x0f);
        }

        this.regs.p.v = ~(this.regs.a.l ^ this.rd.l) & (this.regs.a.l ^ result) & 0x80;
        if(this.regs.p.d && result > 0x9f) result += 0x60;
        this.regs.p.c = result > 0xff;
        this.regs.p.n = result & 0x80;
        this.regs.p.z = result == 0;

        this.regs.a.l = result;
    },

    adc_w: function() {
        var result;

        if(!this.regs.p.d) {
            result = this.regs.a.w + this.rd.w + this.regs.p.c;
        } else {
            result = (this.regs.a.w & 0x000f) + (this.rd.w & 0x000f) + (this.regs.p.c <<  0);
            if(result > 0x0009) result += 0x0006;
            this.regs.p.c = result > 0x000f;
            result = (this.regs.a.w & 0x00f0) + (this.rd.w & 0x00f0) + (this.regs.p.c <<  4) + (result & 0x000f);
            if(result > 0x009f) result += 0x0060;
            this.regs.p.c = result > 0x00ff;
            result = (this.regs.a.w & 0x0f00) + (this.rd.w & 0x0f00) + (this.regs.p.c <<  8) + (result & 0x00ff);
            if(result > 0x09ff) result += 0x0600;
            this.regs.p.c = result > 0x0fff;
            result = (this.regs.a.w & 0xf000) + (this.rd.w & 0xf000) + (this.regs.p.c << 12) + (result & 0x0fff);
        }

        this.regs.p.v = ~(this.regs.a.w ^ this.rd.w) & (this.regs.a.w ^ result) & 0x8000;
        if(this.regs.p.d && result > 0x9fff) result += 0x6000;
        this.regs.p.c = result > 0xffff;
        this.regs.p.n = result & 0x8000;
        this.regs.p.z = result == 0;

        this.regs.a.w = result;
    },

    and_b: function() {
        this.regs.a.l &= this.rd.l;
        this.regs.p.n = this.regs.a.l & 0x80;
        this.regs.p.z = this.regs.a.l == 0;
    },

    and_w: function() {
        this.regs.a.w &= this.rd.w;
        this.regs.p.n = this.regs.a.w & 0x8000;
        this.regs.p.z = this.regs.a.w == 0;
    },

    bit_b: function() {
        this.regs.p.n = this.rd.l & 0x80;
        this.regs.p.v = this.rd.l & 0x40;
        this.regs.p.z = (this.rd.l & this.regs.a.l) == 0;
    },

    bit_w: function() {
        this.regs.p.n = this.rd.w & 0x8000;
        this.regs.p.v = this.rd.w & 0x4000;
        this.regs.p.z = (this.rd.w & this.regs.a.w) == 0;
    },

    cmp_b: function() {
        var r = this.regs.a.l - this.rd.l;
        this.regs.p.n = r & 0x80;
        this.regs.p.z = r == 0;
        this.regs.p.c = r >= 0;
    },

    cmp_w: function() {
        var r = this.regs.a.w - this.rd.w;
        this.regs.p.n = r & 0x8000;
        this.regs.p.z = r == 0;
        this.regs.p.c = r >= 0;
    },

    cpx_b: function() {
        var r = this.regs.x.l - this.rd.l;
        this.regs.p.n = r & 0x80;
        this.regs.p.z = r == 0;
        this.regs.p.c = r >= 0;
    },

    cpx_w: function() {
        var r = this.regs.x.w - this.rd.w;
        this.regs.p.n = r & 0x8000;
        this.regs.p.z = r == 0;
        this.regs.p.c = r >= 0;
    },

    cpy_b: function() {
        var r = this.regs.y.l - this.rd.l;
        this.regs.p.n = r & 0x80;
        this.regs.p.z = r == 0;
        this.regs.p.c = r >= 0;
    },

    cpy_w: function() {
        var r = this.regs.y.w - this.rd.w;
        this.regs.p.n = r & 0x8000;
        this.regs.p.z = r == 0;
        this.regs.p.c = r >= 0;
    },

    eor_b: function() {
        this.regs.a.l ^= this.rd.l;
        this.regs.p.n = this.regs.a.l & 0x80;
        this.regs.p.z = this.regs.a.l == 0;
    },

    eor_w: function() {
        this.regs.a.w ^= this.rd.w;
        this.regs.p.n = this.regs.a.w & 0x8000;
        this.regs.p.z = this.regs.a.w == 0;
    },

    lda_b: function() {
        this.regs.a.l = this.rd.l;
        this.regs.p.n = this.regs.a.l & 0x80;
        this.regs.p.z = this.regs.a.l == 0;
    },

    lda_w: function() {
        this.regs.a.w = this.rd.w;
        this.regs.p.n = this.regs.a.w & 0x8000;
        this.regs.p.z = this.regs.a.w == 0;
    },

    ldx_b: function() {
        this.regs.x.l = this.rd.l;
        this.regs.p.n = this.regs.x.l & 0x80;
        this.regs.p.z = this.regs.x.l == 0;
    },

    ldx_w: function() {
        this.regs.x.w = this.rd.w;
        this.regs.p.n = this.regs.x.w & 0x8000;
        this.regs.p.z = this.regs.x.w == 0;
    },

    ldy_b: function() {
        this.regs.y.l = this.rd.l;
        this.regs.p.n = this.regs.y.l & 0x80;
        this.regs.p.z = this.regs.y.l == 0;
    },

    ldy_w: function() {
        this.regs.y.w = this.rd.w;
        this.regs.p.n = this.regs.y.w & 0x8000;
        this.regs.p.z = this.regs.y.w == 0;
    },

    ora_b: function() {
        this.regs.a.l |= this.rd.l;
        this.regs.p.n = this.regs.a.l & 0x80;
        this.regs.p.z = this.regs.a.l == 0;
    },

    ora_w: function() {
        this.regs.a.w |= this.rd.w;
        this.regs.p.n = this.regs.a.w & 0x8000;
        this.regs.p.z = this.regs.a.w == 0;
    },

    sbc_b: function() {
        var result;
        this.rd.l ^= 0xff;

        if(!this.regs.p.d) {
            result = this.regs.a.l + this.rd.l + this.regs.p.c;
        } else {
            result = (this.regs.a.l & 0x0f) + (this.rd.l & 0x0f) + (this.regs.p.c << 0);
            if(result <= 0x0f) result -= 0x06;
            this.regs.p.c = result > 0x0f;
            result = (this.regs.a.l & 0xf0) + (this.rd.l & 0xf0) + (this.regs.p.c << 4) + (result & 0x0f);
        }

        this.regs.p.v = ~(this.regs.a.l ^ this.rd.l) & (this.regs.a.l ^ result) & 0x80;
        if(this.regs.p.d && result <= 0xff) result -= 0x60;
        this.regs.p.c = result > 0xff;
        this.regs.p.n = result & 0x80;
        this.regs.p.z = result == 0;

        this.regs.a.l = result;
    },

    sbc_w: function() {
        var result;
        this.rd.w ^= 0xffff;

        if(!this.regs.p.d) {
            result = this.regs.a.w + this.rd.w + this.regs.p.c;
        } else {
            result = (this.regs.a.w & 0x000f) + (this.rd.w & 0x000f) + (this.regs.p.c <<  0);
            if(result <= 0x000f) result -= 0x0006;
            this.regs.p.c = result > 0x000f;
            result = (this.regs.a.w & 0x00f0) + (this.rd.w & 0x00f0) + (this.regs.p.c <<  4) + (result & 0x000f);
            if(result <= 0x00ff) result -= 0x0060;
            this.regs.p.c = result > 0x00ff;
            result = (this.regs.a.w & 0x0f00) + (this.rd.w & 0x0f00) + (this.regs.p.c <<  8) + (result & 0x00ff);
            if(result <= 0x0fff) result -= 0x0600;
            this.regs.p.c = result > 0x0fff;
            result = (this.regs.a.w & 0xf000) + (this.rd.w & 0xf000) + (this.regs.p.c << 12) + (result & 0x0fff);
        }

        this.regs.p.v = ~(this.regs.a.w ^ this.rd.w) & (this.regs.a.w ^ result) & 0x8000;
        if(this.regs.p.d && result <= 0xffff) result -= 0x6000;
        this.regs.p.c = result > 0xffff;
        this.regs.p.n = result & 0x8000;
        this.regs.p.z = result == 0;

        this.regs.a.w = result;
    },

    inc_b: function() {
        this.rd.l++;
        this.regs.p.n = this.rd.l & 0x80;
        this.regs.p.z = this.rd.l == 0;
    },

    inc_w: function() {
        this.rd.w++;
        this.regs.p.n = this.rd.w & 0x8000;
        this.regs.p.z = this.rd.w == 0;
    },

    dec_b: function() {
        this.rd.l--;
        this.regs.p.n = this.rd.l & 0x80;
        this.regs.p.z = this.rd.l == 0;
    },

    dec_w: function() {
        this.rd.w--;
        this.regs.p.n = this.rd.w & 0x8000;
        this.regs.p.z = this.rd.w == 0;
    },

    asl_b: function() {
        this.regs.p.c = this.rd.l & 0x80;
        this.rd.l <<= 1;
        this.regs.p.n = this.rd.l & 0x80;
        this.regs.p.z = this.rd.l == 0;
    },

    asl_w: function() {
        this.regs.p.c = this.rd.w & 0x8000;
        this.rd.w <<= 1;
        this.regs.p.n = this.rd.w & 0x8000;
        this.regs.p.z = this.rd.w == 0;
    },

    lsr_b: function() {
        this.regs.p.c = this.rd.l & 1;
        this.rd.l >>= 1;
        this.regs.p.n = this.rd.l & 0x80;
        this.regs.p.z = this.rd.l == 0;
    },

    lsr_w: function() {
        this.regs.p.c = this.rd.w & 1;
        this.rd.w >>= 1;
        this.regs.p.n = this.rd.w & 0x8000;
        this.regs.p.z = this.rd.w == 0;
    },

    rol_b: function() {
        var carry = this.regs.p.c;
        this.regs.p.c = this.rd.l & 0x80;
        this.rd.l = (this.rd.l << 1) | carry;
        this.regs.p.n = this.rd.l & 0x80;
        this.regs.p.z = this.rd.l == 0;
    },

    rol_w: function() {
        var carry = this.regs.p.c;
        this.regs.p.c = this.rd.w & 0x8000;
        this.rd.w = (this.rd.w << 1) | carry;
        this.regs.p.n = this.rd.w & 0x8000;
        this.regs.p.z = this.rd.w == 0;
    },

    ror_b: function() {
        var carry = this.regs.p.c << 7;
        this.regs.p.c = this.rd.l & 1;
        this.rd.l = carry | (this.rd.l >> 1);
        this.regs.p.n = this.rd.l & 0x80;
        this.regs.p.z = this.rd.l == 0;
    },

    ror_w: function() {
        var carry = this.regs.p.c << 15;
        this.regs.p.c = this.rd.w & 1;
        this.rd.w = carry | (this.rd.w >> 1);
        this.regs.p.n = this.rd.w & 0x8000;
        this.regs.p.z = this.rd.w == 0;
    },

    trb_b: function() {
        this.regs.p.z = (this.rd.l & this.regs.a.l) == 0;
        this.rd.l &= ~this.regs.a.l;
    },

    trb_w: function() {
        this.regs.p.z = (this.rd.w & this.regs.a.w) == 0;
        this.rd.w &= ~this.regs.a.w;
    },

    tsb_b: function() {
        this.regs.p.z = (this.rd.l & this.regs.a.l) == 0;
        this.rd.l |= this.regs.a.l;
    },

    tsb_w: function() {
        this.regs.p.z = (this.rd.w & this.regs.a.w) == 0;
        this.rd.w |= this.regs.a.w;
    }
};
