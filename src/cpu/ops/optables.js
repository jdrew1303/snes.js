// The optables map the opcodes to an actual function
var optables = {};

module.exports = optables;

//require all op implementations and reduce them to a single object
var ops = optables.ops = [
    require('./algorithms'),
    require('./misc'),
    require('./pc'),
    require('./read'),
    require('./rmw'),
    require('./write')
].reduce(function(p, c){
    for(var k in c) {
        p[k] = c[k];
    }

    return p;
}, {});

// 8-bit accumulator,  8-bit index (emulation mode)
optables.OPTABLE_EM = [];

// 8-bit accumulator,  8-bit index
optables.OPTABLE_MX = [];

// 8-bit accumulator, 16-bit index
optables.OPTABLE_Mx = [];

//16-bit accumulator,  8-bit index
optables.OPTABLE_mX = [];

//16-bit accumulator, 16-bit index
optables.OPTABLE_mx = [];

//helpers to add items to the proper tables.
function opA(  cpu, id, name       ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name].bind(cpu); }
function opAII(cpu, id, name, x, y ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name].bind(cpu, x, y); }
function opE(  cpu, id, name       ) { optables.OPTABLE_EM[id] = ops[name + '_e'].bind(cpu); optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_n'].bind(cpu); }
function opEI( cpu, id, name, x    ) { optables.OPTABLE_EM[id] = ops[name + '_e'].bind(cpu, x); optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_n'].bind(cpu, x); }
function opEII(cpu, id, name, x, y ) { optables.OPTABLE_EM[id] = ops[name + '_e'].bind(cpu, x, y); optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_n'].bind(cpu, x, y); }
function opM(  cpu, id, name       ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = ops[name + '_b'].bind(cpu); optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu); }
function opMI( cpu, id, name, x    ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = ops[name + '_b'].bind(cpu, x); optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, x); }
function opMII(cpu, id, name, x, y ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = ops[name + '_b'].bind(cpu, x, y); optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, x, y); }
function opMF( cpu, id, name, fn   ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu)); optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu)); }
function opMFI(cpu, id, name, fn, x) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_Mx[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu), x); optables.OPTABLE_mX[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu), x); }
function opX(  cpu, id, name       ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_mX[id] = ops[name + '_b'].bind(cpu); optables.OPTABLE_Mx[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu); }
function opXI( cpu, id, name, x    ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_mX[id] = ops[name + '_b'].bind(cpu, x); optables.OPTABLE_Mx[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, x); }
function opXII(cpu, id, name, x, y ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_mX[id] = ops[name + '_b'].bind(cpu, x, y); optables.OPTABLE_Mx[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, x, y); }
function opXF( cpu, id, name, fn   ) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_mX[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu)); optables.OPTABLE_Mx[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu)); }
function opXFI(cpu, id, name, fn, x) { optables.OPTABLE_EM[id] = optables.OPTABLE_MX[id] = optables.OPTABLE_mX[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu), x); optables.OPTABLE_Mx[id] = optables.OPTABLE_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu), x); }

//adds all the opcodes to the tables
optables.initOpTable = function(cpu) {
    opEII(cpu, 0x00, 'interrupt', 0xfffe, 0xffe6);
    opMF (cpu, 0x01, 'read_idpx', 'ora');
    opEII(cpu, 0x02, 'interrupt', 0xfff4, 0xffe4);
    opMF (cpu, 0x03, 'read_sr', 'ora');
    opMF (cpu, 0x04, 'adjust_dp', 'tsb');
    opMF (cpu, 0x05, 'read_dp', 'ora');
    opMF (cpu, 0x06, 'adjust_dp', 'asl');
    opMF (cpu, 0x07, 'read_ildp', 'ora');
    opA  (cpu, 0x08, 'php');
    opMF (cpu, 0x09, 'read_const', 'ora');
    opM  (cpu, 0x0a, 'asl_imm');
    opE  (cpu, 0x0b, 'phd');
    opMF (cpu, 0x0c, 'adjust_addr', 'tsb');
    opMF (cpu, 0x0d, 'read_addr', 'ora');
    opMF (cpu, 0x0e, 'adjust_addr', 'asl');
    opMF (cpu, 0x0f, 'read_long', 'ora');
    opAII(cpu, 0x10, 'branch', 0x80, false);
    opMF (cpu, 0x11, 'read_idpy', 'ora');
    opMF (cpu, 0x12, 'read_idp', 'ora');
    opMF (cpu, 0x13, 'read_isry', 'ora');
    opMF (cpu, 0x14, 'adjust_dp', 'trb');
    opMFI(cpu, 0x15, 'read_dpr', 'ora', 'x');
    opMF (cpu, 0x16, 'adjust_dpx', 'asl');
    opMF (cpu, 0x17, 'read_ildpy', 'ora');
    opAII(cpu, 0x18, 'flag', 0x01, 0x00);
    opMF (cpu, 0x19, 'read_addry', 'ora');
    opMII(cpu, 0x1a, 'adjust_imm', 'a', 1);
    opE  (cpu, 0x1b, 'tcs');
    opMF (cpu, 0x1c, 'adjust_addr', 'trb');
    opMF (cpu, 0x1d, 'read_addrx', 'ora');
    opMF (cpu, 0x1e, 'adjust_addrx', 'asl');
    opMF (cpu, 0x1f, 'read_longx', 'ora');
    opA  (cpu, 0x20, 'jsr_addr');
    opMF (cpu, 0x21, 'read_idpx', 'and');
    opE  (cpu, 0x22, 'jsr_long');
    opMF (cpu, 0x23, 'read_sr', 'and');
    opMF (cpu, 0x24, 'read_dp', 'bit');
    opMF (cpu, 0x25, 'read_dp', 'and');
    opMF (cpu, 0x26, 'adjust_dp', 'rol');
    opMF (cpu, 0x27, 'read_ildp', 'and');
    opE  (cpu, 0x28, 'plp');
    opMF (cpu, 0x29, 'read_const', 'and');
    opM  (cpu, 0x2a, 'rol_imm');
    opE  (cpu, 0x2b, 'pld');
    opMF (cpu, 0x2c, 'read_addr', 'bit');
    opMF (cpu, 0x2d, 'read_addr', 'and');
    opMF (cpu, 0x2e, 'adjust_addr', 'rol');
    opMF (cpu, 0x2f, 'read_long', 'and');
    opAII(cpu, 0x30, 'branch', 0x80, true);
    opMF (cpu, 0x31, 'read_idpy', 'and');
    opMF (cpu, 0x32, 'read_idp', 'and');
    opMF (cpu, 0x33, 'read_isry', 'and');
    opMFI(cpu, 0x34, 'read_dpr', 'bit', 'x');
    opMFI(cpu, 0x35, 'read_dpr', 'and', 'x');
    opMF (cpu, 0x36, 'adjust_dpx', 'rol');
    opMF (cpu, 0x37, 'read_ildpy', 'and');
    opAII(cpu, 0x38, 'flag', 0x01, 0x01);
    opMF (cpu, 0x39, 'read_addry', 'and');
    opMII(cpu, 0x3a, 'adjust_imm', 'a', -1);
    opAII(cpu, 0x3b, 'transfer_w', 's', 'a');
    opMF (cpu, 0x3c, 'read_addrx', 'bit');
    opMF (cpu, 0x3d, 'read_addrx', 'and');
    opMF (cpu, 0x3e, 'adjust_addrx', 'rol');
    opMF (cpu, 0x3f, 'read_longx', 'and');
    opE  (cpu, 0x40, 'rti');
    opMF (cpu, 0x41, 'read_idpx', 'eor');
    opA  (cpu, 0x42, 'wdm');
    opMF (cpu, 0x43, 'read_sr', 'eor');
    opXI (cpu, 0x44, 'move', -1);
    opMF (cpu, 0x45, 'read_dp', 'eor');
    opMF (cpu, 0x46, 'adjust_dp', 'lsr');
    opMF (cpu, 0x47, 'read_ildp', 'eor');
    opMI (cpu, 0x48, 'push', 'a');
    opMF (cpu, 0x49, 'read_const', 'eor');
    opM  (cpu, 0x4a, 'lsr_imm');
    opA  (cpu, 0x4b, 'phk');
    opA  (cpu, 0x4c, 'jmp_addr');
    opMF (cpu, 0x4d, 'read_addr', 'eor');
    opMF (cpu, 0x4e, 'adjust_addr', 'lsr');
    opMF (cpu, 0x4f, 'read_long', 'eor');
    opAII(cpu, 0x50, 'branch', 0x40, false);
    opMF (cpu, 0x51, 'read_idpy', 'eor');
    opMF (cpu, 0x52, 'read_idp', 'eor');
    opMF (cpu, 0x53, 'read_isry', 'eor');
    opXI (cpu, 0x54, 'move', 1);
    opMFI(cpu, 0x55, 'read_dpr', 'eor', 'x');
    opMF (cpu, 0x56, 'adjust_dpx', 'lsr');
    opMF (cpu, 0x57, 'read_ildpy', 'eor');
    opAII(cpu, 0x58, 'flag', 0x04, 0x00);
    opMF (cpu, 0x59, 'read_addry', 'eor');
    opXI (cpu, 0x5a, 'push', 'y');
    opAII(cpu, 0x5b, 'transfer_w', 'a', 'd');
    opA  (cpu, 0x5c, 'jmp_long');
    opMF (cpu, 0x5d, 'read_addrx', 'eor');
    opMF (cpu, 0x5e, 'adjust_addrx', 'lsr');
    opMF (cpu, 0x5f, 'read_longx', 'eor');
    opA  (cpu, 0x60, 'rts');
    opMF (cpu, 0x61, 'read_idpx', 'adc');
    opE  (cpu, 0x62, 'per');
    opMF (cpu, 0x63, 'read_sr', 'adc');
    opMI (cpu, 0x64, 'write_dp', 'z');
    opMF (cpu, 0x65, 'read_dp', 'adc');
    opMF (cpu, 0x66, 'adjust_dp', 'ror');
    opMF (cpu, 0x67, 'read_ildp', 'adc');
    opMI (cpu, 0x68, 'pull', 'a');
    opMF (cpu, 0x69, 'read_const', 'adc');
    opM  (cpu, 0x6a, 'ror_imm');
    opE  (cpu, 0x6b, 'rtl');
    opA  (cpu, 0x6c, 'jmp_iaddr');
    opMF (cpu, 0x6d, 'read_addr', 'adc');
    opMF (cpu, 0x6e, 'adjust_addr', 'ror');
    opMF (cpu, 0x6f, 'read_long', 'adc');
    opAII(cpu, 0x70, 'branch', 0x40, true);
    opMF (cpu, 0x71, 'read_idpy', 'adc');
    opMF (cpu, 0x72, 'read_idp', 'adc');
    opMF (cpu, 0x73, 'read_isry', 'adc');
    opMII(cpu, 0x74, 'write_dpr', 'z', 'x');
    opMFI(cpu, 0x75, 'read_dpr', 'adc', 'x');
    opMF (cpu, 0x76, 'adjust_dpx', 'ror');
    opMF (cpu, 0x77, 'read_ildpy', 'adc');
    opAII(cpu, 0x78, 'flag', 0x04, 0x04);
    opMF (cpu, 0x79, 'read_addry', 'adc');
    opXI (cpu, 0x7a, 'pull', 'y');
    opAII(cpu, 0x7b, 'transfer_w', 'd', 'a');
    opA  (cpu, 0x7c, 'jmp_iaddrx');
    opMF (cpu, 0x7d, 'read_addrx', 'adc');
    opMF (cpu, 0x7e, 'adjust_addrx', 'ror');
    opMF (cpu, 0x7f, 'read_longx', 'adc');
    opA  (cpu, 0x80, 'bra');
    opM  (cpu, 0x81, 'sta_idpx');
    opA  (cpu, 0x82, 'brl');
    opM  (cpu, 0x83, 'sta_sr');
    opXI (cpu, 0x84, 'write_dp', 'y');
    opMI (cpu, 0x85, 'write_dp', 'a');
    opXI (cpu, 0x86, 'write_dp', 'x');
    opM  (cpu, 0x87, 'sta_ildp');
    opXII(cpu, 0x88, 'adjust_imm', 'y', -1);
    opM  (cpu, 0x89, 'read_bit_const');
    opMII(cpu, 0x8a, 'transfer', 'x', 'a');
    opA  (cpu, 0x8b, 'phb');
    opXI (cpu, 0x8c, 'write_addr', 'y');
    opMI (cpu, 0x8d, 'write_addr', 'a');
    opXI (cpu, 0x8e, 'write_addr', 'x');
    opMI (cpu, 0x8f, 'write_longr', 'z');
    opAII(cpu, 0x90, 'branch', 0x01, false);
    opM  (cpu, 0x91, 'sta_idpy');
    opM  (cpu, 0x92, 'sta_idp');
    opM  (cpu, 0x93, 'sta_isry');
    opXII(cpu, 0x94, 'write_dpr', 'y', 'x');
    opMII(cpu, 0x95, 'write_dpr', 'a', 'x');
    opXII(cpu, 0x96, 'write_dpr', 'x', 'y');
    opM  (cpu, 0x97, 'sta_ildpy');
    opMII(cpu, 0x98, 'transfer', 'y', 'a');
    opMII(cpu, 0x99, 'write_addrr', 'a', 'y');
    opE  (cpu, 0x9a, 'txs');
    opXII(cpu, 0x9b, 'transfer', 'x', 'y');
    opMI (cpu, 0x9c, 'write_addr', 'z');
    opMII(cpu, 0x9d, 'write_addrr', 'a', 'x');
    opMII(cpu, 0x9e, 'write_addrr', 'z', 'x');
    opMI (cpu, 0x9f, 'write_longr', 'x');
    opXF (cpu, 0xa0, 'read_const', 'ldy');
    opMF (cpu, 0xa1, 'read_idpx', 'lda');
    opXF (cpu, 0xa2, 'read_const', 'ldx');
    opMF (cpu, 0xa3, 'read_sr', 'lda');
    opXF (cpu, 0xa4, 'read_dp', 'ldy');
    opMF (cpu, 0xa5, 'read_dp', 'lda');
    opXF (cpu, 0xa6, 'read_dp', 'ldx');
    opMF (cpu, 0xa7, 'read_ildp', 'lda');
    opXII(cpu, 0xa8, 'transfer', 'a', 'y');
    opMF (cpu, 0xa9, 'read_const', 'lda');
    opXII(cpu, 0xaa, 'transfer', 'a', 'x');
    opA  (cpu, 0xab, 'plb');
    opXF (cpu, 0xac, 'read_addr', 'ldy');
    opMF (cpu, 0xad, 'read_addr', 'lda');
    opXF (cpu, 0xae, 'read_addr', 'ldx');
    opMF (cpu, 0xaf, 'read_long', 'lda');
    opAII(cpu, 0xb0, 'branch', 0x01, true);
    opMF (cpu, 0xb1, 'read_idpy', 'lda');
    opMF (cpu, 0xb2, 'read_idp', 'lda');
    opMF (cpu, 0xb3, 'read_isry', 'lda');
    opXFI(cpu, 0xb4, 'read_dpr', 'ldy', 'x');
    opMFI(cpu, 0xb5, 'read_dpr', 'lda', 'x');
    opXFI(cpu, 0xb6, 'read_dpr', 'ldx', 'y');
    opMF (cpu, 0xb7, 'read_ildpy', 'lda');
    opAII(cpu, 0xb8, 'flag', 0x40, 0x00);
    opMF (cpu, 0xb9, 'read_addry', 'lda');
    opX  (cpu, 0xba, 'tsx');
    opXII(cpu, 0xbb, 'transfer', 'y', 'x');
    opXF (cpu, 0xbc, 'read_addrx', 'ldy');
    opMF (cpu, 0xbd, 'read_addrx', 'lda');
    opXF (cpu, 0xbe, 'read_addry', 'ldx');
    opMF (cpu, 0xbf, 'read_longx', 'lda');
    opXF (cpu, 0xc0, 'read_const', 'cpy');
    opMF (cpu, 0xc1, 'read_idpx', 'cmp');
    opEI (cpu, 0xc2, 'pflag', 0);
    opMF (cpu, 0xc3, 'read_sr', 'cmp');
    opXF (cpu, 0xc4, 'read_dp', 'cpy');
    opMF (cpu, 0xc5, 'read_dp', 'cmp');
    opMF (cpu, 0xc6, 'adjust_dp', 'dec');
    opMF (cpu, 0xc7, 'read_ildp', 'cmp');
    opXII(cpu, 0xc8, 'adjust_imm', 'y', 1);
    opMF (cpu, 0xc9, 'read_const', 'cmp');
    opXII(cpu, 0xca, 'adjust_imm', 'x', -1);
    opA  (cpu, 0xcb, 'wai');
    opXF (cpu, 0xcc, 'read_addr', 'cpy');
    opMF (cpu, 0xcd, 'read_addr', 'cmp');
    opMF (cpu, 0xce, 'adjust_addr', 'dec');
    opMF (cpu, 0xcf, 'read_long', 'cmp');
    opAII(cpu, 0xd0, 'branch', 0x02, false);
    opMF (cpu, 0xd1, 'read_idpy', 'cmp');
    opMF (cpu, 0xd2, 'read_idp', 'cmp');
    opMF (cpu, 0xd3, 'read_isry', 'cmp');
    opE  (cpu, 0xd4, 'pei');
    opMFI(cpu, 0xd5, 'read_dpr', 'cmp', 'x');
    opMF (cpu, 0xd6, 'adjust_dpx', 'dec');
    opMF (cpu, 0xd7, 'read_ildpy', 'cmp');
    opAII(cpu, 0xd8, 'flag', 0x08, 0x00);
    opMF (cpu, 0xd9, 'read_addry', 'cmp');
    opXI (cpu, 0xda, 'push', 'x');
    opA  (cpu, 0xdb, 'stp');
    opA  (cpu, 0xdc, 'jmp_iladdr');
    opMF (cpu, 0xdd, 'read_addrx', 'cmp');
    opMF (cpu, 0xde, 'adjust_addrx', 'dec');
    opMF (cpu, 0xdf, 'read_longx', 'cmp');
    opXF (cpu, 0xe0, 'read_const', 'cpx');
    opMF (cpu, 0xe1, 'read_idpx', 'sbc');
    opEI (cpu, 0xe2, 'pflag', 1);
    opMF (cpu, 0xe3, 'read_sr', 'sbc');
    opXF (cpu, 0xe4, 'read_dp', 'cpx');
    opMF (cpu, 0xe5, 'read_dp', 'sbc');
    opMF (cpu, 0xe6, 'adjust_dp', 'inc');
    opMF (cpu, 0xe7, 'read_ildp', 'sbc');
    opXII(cpu, 0xe8, 'adjust_imm', 'x', 1);
    opMF (cpu, 0xe9, 'read_const', 'sbc');
    opA  (cpu, 0xea, 'nop');
    opA  (cpu, 0xeb, 'xba');
    opXF (cpu, 0xec, 'read_addr', 'cpx');
    opMF (cpu, 0xed, 'read_addr', 'sbc');
    opMF (cpu, 0xee, 'adjust_addr', 'inc');
    opMF (cpu, 0xef, 'read_long', 'sbc');
    opAII(cpu, 0xf0, 'branch', 0x02, true);
    opMF (cpu, 0xf1, 'read_idpy', 'sbc');
    opMF (cpu, 0xf2, 'read_idp', 'sbc');
    opMF (cpu, 0xf3, 'read_isry', 'sbc');
    opE  (cpu, 0xf4, 'pea');
    opMFI(cpu, 0xf5, 'read_dpr', 'sbc', 'x');
    opMF (cpu, 0xf6, 'adjust_dpx', 'inc');
    opMF (cpu, 0xf7, 'read_ildpy', 'sbc');
    opAII(cpu, 0xf8, 'flag', 0x08, 0x08);
    opMF (cpu, 0xf9, 'read_addry', 'sbc');
    opXI (cpu, 0xfa, 'pull', 'x');
    opA  (cpu, 0xfb, 'xce');
    opE  (cpu, 0xfc, 'jsr_iaddrx');
    opMF (cpu, 0xfd, 'read_addrx', 'sbc');
    opMF (cpu, 0xfe, 'adjust_addrx', 'inc');
    opMF (cpu, 0xff, 'read_longx', 'sbc');
};
