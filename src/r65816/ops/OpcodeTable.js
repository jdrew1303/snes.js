//require all op implementations and reduce them to a single object
var ops = [
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

//opcode table implementation
var OpcodeTable = function(cpu) {
    // 8-bit accumulator,  8-bit index (emulation mode)
    this.optable_EM = [];

    // 8-bit accumulator,  8-bit index
    this.optable_MX = [];

    // 8-bit accumulator, 16-bit index
    this.optable_Mx = [];

    //16-bit accumulator,  8-bit index
    this.optable_mX = [];

    //16-bit accumulator, 16-bit index
    this.optable_mx = [];

    //initialize the opcode tables
    this.initTables(cpu);
};

OpcodeTable.prototype.constructor = OpcodeTable;

module.exports = OpcodeTable;

OpcodeTable.prototype.ops = ops;

//helpers to add items to the proper tables.
function opA(  table, cpu, id, name       ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_Mx[id] = table.optable_mX[id] = table.optable_mx[id] = ops[name].bind(cpu); }
function opAII(table, cpu, id, name, x, y ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_Mx[id] = table.optable_mX[id] = table.optable_mx[id] = ops[name].bind(cpu, x, y); }
function opE(  table, cpu, id, name       ) { table.optable_EM[id] = ops[name + '_e'].bind(cpu); table.optable_MX[id] = table.optable_Mx[id] = table.optable_mX[id] = table.optable_mx[id] = ops[name + '_n'].bind(cpu); }
function opEI( table, cpu, id, name, x    ) { table.optable_EM[id] = ops[name + '_e'].bind(cpu, x); table.optable_MX[id] = table.optable_Mx[id] = table.optable_mX[id] = table.optable_mx[id] = ops[name + '_n'].bind(cpu, x); }
function opEII(table, cpu, id, name, x, y ) { table.optable_EM[id] = ops[name + '_e'].bind(cpu, x, y); table.optable_MX[id] = table.optable_Mx[id] = table.optable_mX[id] = table.optable_mx[id] = ops[name + '_n'].bind(cpu, x, y); }
function opM(  table, cpu, id, name       ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_Mx[id] = ops[name + '_b'].bind(cpu); table.optable_mX[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu); }
function opMI( table, cpu, id, name, x    ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_Mx[id] = ops[name + '_b'].bind(cpu, x); table.optable_mX[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, x); }
function opMII(table, cpu, id, name, x, y ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_Mx[id] = ops[name + '_b'].bind(cpu, x, y); table.optable_mX[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, x, y); }
function opMF( table, cpu, id, name, fn   ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_Mx[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu)); table.optable_mX[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu)); }
function opMFI(table, cpu, id, name, fn, x) { table.optable_EM[id] = table.optable_MX[id] = table.optable_Mx[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu), x); table.optable_mX[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu), x); }
function opX(  table, cpu, id, name       ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_mX[id] = ops[name + '_b'].bind(cpu); table.optable_Mx[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu); }
function opXI( table, cpu, id, name, x    ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_mX[id] = ops[name + '_b'].bind(cpu, x); table.optable_Mx[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, x); }
function opXII(table, cpu, id, name, x, y ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_mX[id] = ops[name + '_b'].bind(cpu, x, y); table.optable_Mx[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, x, y); }
function opXF( table, cpu, id, name, fn   ) { table.optable_EM[id] = table.optable_MX[id] = table.optable_mX[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu)); table.optable_Mx[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu)); }
function opXFI(table, cpu, id, name, fn, x) { table.optable_EM[id] = table.optable_MX[id] = table.optable_mX[id] = ops[name + '_b'].bind(cpu, ops[fn + '_b'].bind(cpu), x); table.optable_Mx[id] = table.optable_mx[id] = ops[name + '_w'].bind(cpu, ops[fn + '_w'].bind(cpu), x); }

//adds all the opcodes to the tables
OpcodeTable.prototype.initTables = function(cpu) {
    opEII(this, cpu, 0x00, 'interrupt', 0xfffe, 0xffe6);
    opMF (this, cpu, 0x01, 'read_idpx', 'ora');
    opEII(this, cpu, 0x02, 'interrupt', 0xfff4, 0xffe4);
    opMF (this, cpu, 0x03, 'read_sr', 'ora');
    opMF (this, cpu, 0x04, 'adjust_dp', 'tsb');
    opMF (this, cpu, 0x05, 'read_dp', 'ora');
    opMF (this, cpu, 0x06, 'adjust_dp', 'asl');
    opMF (this, cpu, 0x07, 'read_ildp', 'ora');
    opA  (this, cpu, 0x08, 'php');
    opMF (this, cpu, 0x09, 'read_const', 'ora');
    opM  (this, cpu, 0x0a, 'asl_imm');
    opE  (this, cpu, 0x0b, 'phd');
    opMF (this, cpu, 0x0c, 'adjust_addr', 'tsb');
    opMF (this, cpu, 0x0d, 'read_addr', 'ora');
    opMF (this, cpu, 0x0e, 'adjust_addr', 'asl');
    opMF (this, cpu, 0x0f, 'read_long', 'ora');
    opAII(this, cpu, 0x10, 'branch', 0x80, false);
    opMF (this, cpu, 0x11, 'read_idpy', 'ora');
    opMF (this, cpu, 0x12, 'read_idp', 'ora');
    opMF (this, cpu, 0x13, 'read_isry', 'ora');
    opMF (this, cpu, 0x14, 'adjust_dp', 'trb');
    opMFI(this, cpu, 0x15, 'read_dpr', 'ora', 'x');
    opMF (this, cpu, 0x16, 'adjust_dpx', 'asl');
    opMF (this, cpu, 0x17, 'read_ildpy', 'ora');
    opAII(this, cpu, 0x18, 'flag', 0x01, 0x00);
    opMF (this, cpu, 0x19, 'read_addry', 'ora');
    opMII(this, cpu, 0x1a, 'adjust_imm', 'a', 1);
    opE  (this, cpu, 0x1b, 'tcs');
    opMF (this, cpu, 0x1c, 'adjust_addr', 'trb');
    opMF (this, cpu, 0x1d, 'read_addrx', 'ora');
    opMF (this, cpu, 0x1e, 'adjust_addrx', 'asl');
    opMF (this, cpu, 0x1f, 'read_longx', 'ora');
    opA  (this, cpu, 0x20, 'jsr_addr');
    opMF (this, cpu, 0x21, 'read_idpx', 'and');
    opE  (this, cpu, 0x22, 'jsr_long');
    opMF (this, cpu, 0x23, 'read_sr', 'and');
    opMF (this, cpu, 0x24, 'read_dp', 'bit');
    opMF (this, cpu, 0x25, 'read_dp', 'and');
    opMF (this, cpu, 0x26, 'adjust_dp', 'rol');
    opMF (this, cpu, 0x27, 'read_ildp', 'and');
    opE  (this, cpu, 0x28, 'plp');
    opMF (this, cpu, 0x29, 'read_const', 'and');
    opM  (this, cpu, 0x2a, 'rol_imm');
    opE  (this, cpu, 0x2b, 'pld');
    opMF (this, cpu, 0x2c, 'read_addr', 'bit');
    opMF (this, cpu, 0x2d, 'read_addr', 'and');
    opMF (this, cpu, 0x2e, 'adjust_addr', 'rol');
    opMF (this, cpu, 0x2f, 'read_long', 'and');
    opAII(this, cpu, 0x30, 'branch', 0x80, true);
    opMF (this, cpu, 0x31, 'read_idpy', 'and');
    opMF (this, cpu, 0x32, 'read_idp', 'and');
    opMF (this, cpu, 0x33, 'read_isry', 'and');
    opMFI(this, cpu, 0x34, 'read_dpr', 'bit', 'x');
    opMFI(this, cpu, 0x35, 'read_dpr', 'and', 'x');
    opMF (this, cpu, 0x36, 'adjust_dpx', 'rol');
    opMF (this, cpu, 0x37, 'read_ildpy', 'and');
    opAII(this, cpu, 0x38, 'flag', 0x01, 0x01);
    opMF (this, cpu, 0x39, 'read_addry', 'and');
    opMII(this, cpu, 0x3a, 'adjust_imm', 'a', -1);
    opAII(this, cpu, 0x3b, 'transfer_w', 's', 'a');
    opMF (this, cpu, 0x3c, 'read_addrx', 'bit');
    opMF (this, cpu, 0x3d, 'read_addrx', 'and');
    opMF (this, cpu, 0x3e, 'adjust_addrx', 'rol');
    opMF (this, cpu, 0x3f, 'read_longx', 'and');
    opE  (this, cpu, 0x40, 'rti');
    opMF (this, cpu, 0x41, 'read_idpx', 'eor');
    opA  (this, cpu, 0x42, 'wdm');
    opMF (this, cpu, 0x43, 'read_sr', 'eor');
    opXI (this, cpu, 0x44, 'move', -1);
    opMF (this, cpu, 0x45, 'read_dp', 'eor');
    opMF (this, cpu, 0x46, 'adjust_dp', 'lsr');
    opMF (this, cpu, 0x47, 'read_ildp', 'eor');
    opMI (this, cpu, 0x48, 'push', 'a');
    opMF (this, cpu, 0x49, 'read_const', 'eor');
    opM  (this, cpu, 0x4a, 'lsr_imm');
    opA  (this, cpu, 0x4b, 'phk');
    opA  (this, cpu, 0x4c, 'jmp_addr');
    opMF (this, cpu, 0x4d, 'read_addr', 'eor');
    opMF (this, cpu, 0x4e, 'adjust_addr', 'lsr');
    opMF (this, cpu, 0x4f, 'read_long', 'eor');
    opAII(this, cpu, 0x50, 'branch', 0x40, false);
    opMF (this, cpu, 0x51, 'read_idpy', 'eor');
    opMF (this, cpu, 0x52, 'read_idp', 'eor');
    opMF (this, cpu, 0x53, 'read_isry', 'eor');
    opXI (this, cpu, 0x54, 'move', 1);
    opMFI(this, cpu, 0x55, 'read_dpr', 'eor', 'x');
    opMF (this, cpu, 0x56, 'adjust_dpx', 'lsr');
    opMF (this, cpu, 0x57, 'read_ildpy', 'eor');
    opAII(this, cpu, 0x58, 'flag', 0x04, 0x00);
    opMF (this, cpu, 0x59, 'read_addry', 'eor');
    opXI (this, cpu, 0x5a, 'push', 'y');
    opAII(this, cpu, 0x5b, 'transfer_w', 'a', 'd');
    opA  (this, cpu, 0x5c, 'jmp_long');
    opMF (this, cpu, 0x5d, 'read_addrx', 'eor');
    opMF (this, cpu, 0x5e, 'adjust_addrx', 'lsr');
    opMF (this, cpu, 0x5f, 'read_longx', 'eor');
    opA  (this, cpu, 0x60, 'rts');
    opMF (this, cpu, 0x61, 'read_idpx', 'adc');
    opE  (this, cpu, 0x62, 'per');
    opMF (this, cpu, 0x63, 'read_sr', 'adc');
    opMI (this, cpu, 0x64, 'write_dp', 'z');
    opMF (this, cpu, 0x65, 'read_dp', 'adc');
    opMF (this, cpu, 0x66, 'adjust_dp', 'ror');
    opMF (this, cpu, 0x67, 'read_ildp', 'adc');
    opMI (this, cpu, 0x68, 'pull', 'a');
    opMF (this, cpu, 0x69, 'read_const', 'adc');
    opM  (this, cpu, 0x6a, 'ror_imm');
    opE  (this, cpu, 0x6b, 'rtl');
    opA  (this, cpu, 0x6c, 'jmp_iaddr');
    opMF (this, cpu, 0x6d, 'read_addr', 'adc');
    opMF (this, cpu, 0x6e, 'adjust_addr', 'ror');
    opMF (this, cpu, 0x6f, 'read_long', 'adc');
    opAII(this, cpu, 0x70, 'branch', 0x40, true);
    opMF (this, cpu, 0x71, 'read_idpy', 'adc');
    opMF (this, cpu, 0x72, 'read_idp', 'adc');
    opMF (this, cpu, 0x73, 'read_isry', 'adc');
    opMII(this, cpu, 0x74, 'write_dpr', 'z', 'x');
    opMFI(this, cpu, 0x75, 'read_dpr', 'adc', 'x');
    opMF (this, cpu, 0x76, 'adjust_dpx', 'ror');
    opMF (this, cpu, 0x77, 'read_ildpy', 'adc');
    opAII(this, cpu, 0x78, 'flag', 0x04, 0x04);
    opMF (this, cpu, 0x79, 'read_addry', 'adc');
    opXI (this, cpu, 0x7a, 'pull', 'y');
    opAII(this, cpu, 0x7b, 'transfer_w', 'd', 'a');
    opA  (this, cpu, 0x7c, 'jmp_iaddrx');
    opMF (this, cpu, 0x7d, 'read_addrx', 'adc');
    opMF (this, cpu, 0x7e, 'adjust_addrx', 'ror');
    opMF (this, cpu, 0x7f, 'read_longx', 'adc');
    opA  (this, cpu, 0x80, 'bra');
    opM  (this, cpu, 0x81, 'sta_idpx');
    opA  (this, cpu, 0x82, 'brl');
    opM  (this, cpu, 0x83, 'sta_sr');
    opXI (this, cpu, 0x84, 'write_dp', 'y');
    opMI (this, cpu, 0x85, 'write_dp', 'a');
    opXI (this, cpu, 0x86, 'write_dp', 'x');
    opM  (this, cpu, 0x87, 'sta_ildp');
    opXII(this, cpu, 0x88, 'adjust_imm', 'y', -1);
    opM  (this, cpu, 0x89, 'read_bit_const');
    opMII(this, cpu, 0x8a, 'transfer', 'x', 'a');
    opA  (this, cpu, 0x8b, 'phb');
    opXI (this, cpu, 0x8c, 'write_addr', 'y');
    opMI (this, cpu, 0x8d, 'write_addr', 'a');
    opXI (this, cpu, 0x8e, 'write_addr', 'x');
    opMI (this, cpu, 0x8f, 'write_longr', 'z');
    opAII(this, cpu, 0x90, 'branch', 0x01, false);
    opM  (this, cpu, 0x91, 'sta_idpy');
    opM  (this, cpu, 0x92, 'sta_idp');
    opM  (this, cpu, 0x93, 'sta_isry');
    opXII(this, cpu, 0x94, 'write_dpr', 'y', 'x');
    opMII(this, cpu, 0x95, 'write_dpr', 'a', 'x');
    opXII(this, cpu, 0x96, 'write_dpr', 'x', 'y');
    opM  (this, cpu, 0x97, 'sta_ildpy');
    opMII(this, cpu, 0x98, 'transfer', 'y', 'a');
    opMII(this, cpu, 0x99, 'write_addrr', 'a', 'y');
    opE  (this, cpu, 0x9a, 'txs');
    opXII(this, cpu, 0x9b, 'transfer', 'x', 'y');
    opMI (this, cpu, 0x9c, 'write_addr', 'z');
    opMII(this, cpu, 0x9d, 'write_addrr', 'a', 'x');
    opMII(this, cpu, 0x9e, 'write_addrr', 'z', 'x');
    opMI (this, cpu, 0x9f, 'write_longr', 'x');
    opXF (this, cpu, 0xa0, 'read_const', 'ldy');
    opMF (this, cpu, 0xa1, 'read_idpx', 'lda');
    opXF (this, cpu, 0xa2, 'read_const', 'ldx');
    opMF (this, cpu, 0xa3, 'read_sr', 'lda');
    opXF (this, cpu, 0xa4, 'read_dp', 'ldy');
    opMF (this, cpu, 0xa5, 'read_dp', 'lda');
    opXF (this, cpu, 0xa6, 'read_dp', 'ldx');
    opMF (this, cpu, 0xa7, 'read_ildp', 'lda');
    opXII(this, cpu, 0xa8, 'transfer', 'a', 'y');
    opMF (this, cpu, 0xa9, 'read_const', 'lda');
    opXII(this, cpu, 0xaa, 'transfer', 'a', 'x');
    opA  (this, cpu, 0xab, 'plb');
    opXF (this, cpu, 0xac, 'read_addr', 'ldy');
    opMF (this, cpu, 0xad, 'read_addr', 'lda');
    opXF (this, cpu, 0xae, 'read_addr', 'ldx');
    opMF (this, cpu, 0xaf, 'read_long', 'lda');
    opAII(this, cpu, 0xb0, 'branch', 0x01, true);
    opMF (this, cpu, 0xb1, 'read_idpy', 'lda');
    opMF (this, cpu, 0xb2, 'read_idp', 'lda');
    opMF (this, cpu, 0xb3, 'read_isry', 'lda');
    opXFI(this, cpu, 0xb4, 'read_dpr', 'ldy', 'x');
    opMFI(this, cpu, 0xb5, 'read_dpr', 'lda', 'x');
    opXFI(this, cpu, 0xb6, 'read_dpr', 'ldx', 'y');
    opMF (this, cpu, 0xb7, 'read_ildpy', 'lda');
    opAII(this, cpu, 0xb8, 'flag', 0x40, 0x00);
    opMF (this, cpu, 0xb9, 'read_addry', 'lda');
    opX  (this, cpu, 0xba, 'tsx');
    opXII(this, cpu, 0xbb, 'transfer', 'y', 'x');
    opXF (this, cpu, 0xbc, 'read_addrx', 'ldy');
    opMF (this, cpu, 0xbd, 'read_addrx', 'lda');
    opXF (this, cpu, 0xbe, 'read_addry', 'ldx');
    opMF (this, cpu, 0xbf, 'read_longx', 'lda');
    opXF (this, cpu, 0xc0, 'read_const', 'cpy');
    opMF (this, cpu, 0xc1, 'read_idpx', 'cmp');
    opEI (this, cpu, 0xc2, 'pflag', 0);
    opMF (this, cpu, 0xc3, 'read_sr', 'cmp');
    opXF (this, cpu, 0xc4, 'read_dp', 'cpy');
    opMF (this, cpu, 0xc5, 'read_dp', 'cmp');
    opMF (this, cpu, 0xc6, 'adjust_dp', 'dec');
    opMF (this, cpu, 0xc7, 'read_ildp', 'cmp');
    opXII(this, cpu, 0xc8, 'adjust_imm', 'y', 1);
    opMF (this, cpu, 0xc9, 'read_const', 'cmp');
    opXII(this, cpu, 0xca, 'adjust_imm', 'x', -1);
    opA  (this, cpu, 0xcb, 'wai');
    opXF (this, cpu, 0xcc, 'read_addr', 'cpy');
    opMF (this, cpu, 0xcd, 'read_addr', 'cmp');
    opMF (this, cpu, 0xce, 'adjust_addr', 'dec');
    opMF (this, cpu, 0xcf, 'read_long', 'cmp');
    opAII(this, cpu, 0xd0, 'branch', 0x02, false);
    opMF (this, cpu, 0xd1, 'read_idpy', 'cmp');
    opMF (this, cpu, 0xd2, 'read_idp', 'cmp');
    opMF (this, cpu, 0xd3, 'read_isry', 'cmp');
    opE  (this, cpu, 0xd4, 'pei');
    opMFI(this, cpu, 0xd5, 'read_dpr', 'cmp', 'x');
    opMF (this, cpu, 0xd6, 'adjust_dpx', 'dec');
    opMF (this, cpu, 0xd7, 'read_ildpy', 'cmp');
    opAII(this, cpu, 0xd8, 'flag', 0x08, 0x00);
    opMF (this, cpu, 0xd9, 'read_addry', 'cmp');
    opXI (this, cpu, 0xda, 'push', 'x');
    opA  (this, cpu, 0xdb, 'stp');
    opA  (this, cpu, 0xdc, 'jmp_iladdr');
    opMF (this, cpu, 0xdd, 'read_addrx', 'cmp');
    opMF (this, cpu, 0xde, 'adjust_addrx', 'dec');
    opMF (this, cpu, 0xdf, 'read_longx', 'cmp');
    opXF (this, cpu, 0xe0, 'read_const', 'cpx');
    opMF (this, cpu, 0xe1, 'read_idpx', 'sbc');
    opEI (this, cpu, 0xe2, 'pflag', 1);
    opMF (this, cpu, 0xe3, 'read_sr', 'sbc');
    opXF (this, cpu, 0xe4, 'read_dp', 'cpx');
    opMF (this, cpu, 0xe5, 'read_dp', 'sbc');
    opMF (this, cpu, 0xe6, 'adjust_dp', 'inc');
    opMF (this, cpu, 0xe7, 'read_ildp', 'sbc');
    opXII(this, cpu, 0xe8, 'adjust_imm', 'x', 1);
    opMF (this, cpu, 0xe9, 'read_const', 'sbc');
    opA  (this, cpu, 0xea, 'nop');
    opA  (this, cpu, 0xeb, 'xba');
    opXF (this, cpu, 0xec, 'read_addr', 'cpx');
    opMF (this, cpu, 0xed, 'read_addr', 'sbc');
    opMF (this, cpu, 0xee, 'adjust_addr', 'inc');
    opMF (this, cpu, 0xef, 'read_long', 'sbc');
    opAII(this, cpu, 0xf0, 'branch', 0x02, true);
    opMF (this, cpu, 0xf1, 'read_idpy', 'sbc');
    opMF (this, cpu, 0xf2, 'read_idp', 'sbc');
    opMF (this, cpu, 0xf3, 'read_isry', 'sbc');
    opE  (this, cpu, 0xf4, 'pea');
    opMFI(this, cpu, 0xf5, 'read_dpr', 'sbc', 'x');
    opMF (this, cpu, 0xf6, 'adjust_dpx', 'inc');
    opMF (this, cpu, 0xf7, 'read_ildpy', 'sbc');
    opAII(this, cpu, 0xf8, 'flag', 0x08, 0x08);
    opMF (this, cpu, 0xf9, 'read_addry', 'sbc');
    opXI (this, cpu, 0xfa, 'pull', 'x');
    opA  (this, cpu, 0xfb, 'xce');
    opE  (this, cpu, 0xfc, 'jsr_iaddrx');
    opMF (this, cpu, 0xfd, 'read_addrx', 'sbc');
    opMF (this, cpu, 0xfe, 'adjust_addrx', 'inc');
    opMF (this, cpu, 0xff, 'read_longx', 'sbc');
};
