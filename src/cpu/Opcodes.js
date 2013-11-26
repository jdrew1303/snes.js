var Opcodes = {};

module.exports = Opcodes;

Opcodes.OPTYPE: {
    // ID               NAME                                FORM            EXAMPLE
    //--------------------------------------------------------------------------------------
    NONE:       -1, //Unknown or Irrelevant Mode
    IMP:        0,  //Implied:                                          PHB
    IMF:        1,  //Immediate Memory Flag:            #dp OR #addr    AND #1 or 2 bytes
    IIF:        2,  //Immediate Index Flag:             #dp OR #addr    LDX #1 or 2 bytes
    IM8B:       3,  //Immediate 8-bit:                  #dp             SEP #byte
    RELB:       4,  //Relative:                         relb            BEQ byte (signed)
    RELW:       5,  //Relative long:                    relw            BRL 2 bytes (signed)
    DP:         6,  //Direct:                           dp              AND byte
    DPX:        7,  //Direct indexed (with X):          dp,x            AND byte, x
    DPY:        8,  //Direct indexed (with Y):          dp,y            AND byte, y
    IDP:        9,  //Direct indirect:                  (dp)            AND (byte)
    IDPX:       10, //Direct indexed indirect:          (dp,x)          AND (byte, x)
    IDPY:       11, //Direct indirect indexed:          (dp),y          AND (byte), y
    ILDP:       12, //Direct indirect long:             [dp]            AND [byte]
    ILDPY:      13, //Direct indirect indexed long:     [dp],y          AND [byte], y
    ADDR:       14, //Absolute:                         addr            AND 2bytes
    ADDRX:      15, //Absolute indexed (with X):        addr,x          AND 2bytes, x
    ADDRY:      16, //Absolute indexed (with Y):        addr,y          AND 2bytes, y
    LONG:       17, //Absolute long:                    long            AND 3bytes
    LONGX:      18, //Absolute indexed long:            long, x         AND 3bytes, x
    SR:         19, //Stack relative:                   sr,s            AND byte, s
    ISRY:       20, //Stack relative indirect indexed:  (sr,s),y        AND (byte, s), y
    IADDR_PC:   21, //Absolute indirect:                pbr:(addr)      JMP (2bytes)
    ADDR_PC:    22, //Absolute indirect long:           pbr:addr        JML 2bytes
    ILADDR:     23, //Absolute indirect long:           [addr]          JML [2bytes]
    IADDRX:     24, //Absolute indexed indirect:        (addr,x)        JMP/JSR (2bytes,x)
    IACC:       25, //Implied accumulator:                              INC
    BLKMV:      26  //Block move:                       dp,dp           MVN/MVP byte, byte
};

Opcodes.OPCODES: [
    {
        id: 0x00,
        asm: 'brk #$%.2x',
        name: 'Break',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 2,
        cycles: function(regs) {
            return 7 + (regs.e ? 1 : 0);
        }
    },
    {
        id: 0x01,
        asm: 'ora ($%.2x,x)',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x02,
        asm: 'cop #$%.2x',
        name: 'Co-Processor Enable',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0x03,
        asm: 'ora $%.2x,s',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x04,
        asm: 'tsb $%.2x',
        name: 'Test and Set Memory Bits Against Accumulator',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x05,
        asm: 'ora $%.2x',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x06,
        asm: 'asl $%.2x',
        name: 'Arithmetic Shift Left',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: function(regs) {
            return 5 + (regs.p.m ? 0 : 2);
        }
    },
    {
        id: 0x07,
        asm: 'ora [$%.2x]',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x08,
        asm: 'php',
        name: 'Push Processor Status Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 3
    },
    {
        id: 0x09,
        asm: 'ora #$%a8.x', //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IMF,
        bytes: 2,
        cycles: 2
    {
        id: 0x0a,
        asm: 'asl a',
        name: 'Arithmetic Shift Left',
        mode: Opcodes.OPTYPE.IACC,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x0b,
        asm: 'phd',
        name: 'Push Direct Page Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 4
    },
    {
        id: 0x0c,
        asm: 'tsb $%.4x',
        name: 'Test and Set Memory Bits Against Accumulator',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x0d,
        asm: 'ora $%.4x',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x0e,
        asm: 'asl $%.4x',
        name: 'Arithmetic Shift Left',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x0f,
        asm: 'ora $%.6x',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x10,
        asm: 'bpl $%.4x',
        name: 'Branch if Plus',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 2
    },
    {
        id: 0x11,
        asm: 'ora ($%.2x),y',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x12,
        asm: 'ora ($%.2x)',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x13,
        asm: 'ora ($%.2x,s),',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0x14,
        asm: 'trb $%.2x',
        name: 'Test and Reset Memory Bits Against Accumulator',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x15,
        asm: 'ora $%.2x,x',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x16,
        asm: 'asl $%.2x,x',
        name: 'Arithmetic Shift Left',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x17,
        asm: 'ora [$%.2x],y',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x18,
        asm: 'clc',
        name: 'Clear Carry',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x19,
        asm: 'ora $%.4x,y',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x1a,
        asm: 'inc',
        alias: 'ina',
        name: 'Increment',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x1b,
        asm: 'tcs',
        name: 'Transfer 16-bit Accumulator to Stack Pointer',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x1c,
        asm: 'trb $%.4x',
        name: 'Test and Reset Memory Bits Against Accumulator',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x1d,
        asm: 'ora $%.4x,x',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x1e,
        asm: 'asl $%.4x,x',
        name: 'Arithmetic Shift Left',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 7
    },
    {
        id: 0x1f,
        asm: 'ora $%.6x,',
        name: 'OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x20,
        asm: 'jsr $%.4x',
        name: 'Jump to Subroutine',
        mode: Opcodes.OPTYPE.ADDR_PC,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x21,
        asm: 'and ($%.2x,x)',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x22,
        asm: 'jsr $%.6x',
        alias: 'jsl',
        name: 'Jump to Subroutine',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 8
    },
    {
        id: 0x23,
        asm: 'and $%.2x,s',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x24,
        asm: 'bit $%.2x',
        name: 'Test Bits',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x25,
        asm: 'and $%.2x',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x26,
        asm: 'rol $%.2x',
        name: 'Rotate Memory or Accumulator Left',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x27,
        asm: 'and [$%.2x]',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x28,
        asm: 'plp',
        name: 'Pull Processor Status Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 4
    },
    {
        id: 0x29,
        asm: 'and #$%a8.x',  //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.IMF,
        bytes: 2,
        cycles: 2
    {
        id: 0x2a,
        asm: 'rol a',
        name: 'Rotate Memory or Accumulator Left',
        mode: Opcodes.OPTYPE.IACC,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x2b,
        asm: 'pld',
        name: 'Pull Direct Page Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 5
    },
    {
        id: 0x2c,
        asm: 'bit $%.4x',
        name: 'Test Bits',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x2d,
        asm: 'and $%.4x',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x2e,
        asm: 'rol $%.4x',
        name: 'Rotate Memory or Accumulator Left',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x2f,
        asm: 'and $%.6x',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x30,
        asm: 'bmi $%.4x',
        name: 'Branch if Minus',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 2
    },
    {
        id: 0x31,
        asm: 'and ($%.2x),y',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x32,
        asm: 'and ($%.2x)',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x33,
        asm: 'and ($%.2x,s),',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0x34,
        asm: 'bit $%.2x,x',
        name: 'Test Bits',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x35,
        asm: 'and $%.2x,x',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x36,
        asm: 'rol $%.2x,x',
        name: 'Rotate Memory or Accumulator Left',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x37,
        asm: 'and [$%.2x],y',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x38,
        asm: 'sec',
        name: 'Set Carry Flag',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x39,
        asm: 'and $%.4x,y',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x3a,
        asm: 'dec',
        alias: 'dea',
        name: 'Decrement',
        mode: Opcodes.OPTYPE.IACC,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x3b,
        asm: 'tsc',
        name: 'Transfer Stack Pointer to 16-bit Accumulator',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x3c,
        asm: 'bit $%.4x,x',
        name: 'Test Bits',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x3d,
        asm: 'and $%.4x,x',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x3e,
        asm: 'rol $%.4x,x',
        name: 'Rotate Memory or Accumulator Left',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 7
    },
    {
        id: 0x3f,
        asm: 'and $%.6x,',
        name: 'AND Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x40,
        asm: 'rti',
        name: 'Return from Interrupt',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 6
    },
    {
        id: 0x41,
        asm: 'eor ($%.2x,x)',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x42,
        asm: 'wdm',
        name: 'Reserved for Future Expansion',
        mode: Opcodes.OPTYPE.NONE,
        bytes: 2,
        cycles: 0
    },
    {
        id: 0x43,
        asm: 'eor $%.2x,s',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x44,
        asm: 'mvp $%.2x,$%.2x',
        name: 'Block Move Positive',
        mode: Opcodes.OPTYPE.BLKMV,
        bytes: 3,
        cycles: 1
    },
    {
        id: 0x45,
        asm: 'eor $%.2x',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x46,
        asm: 'lsr $%.2x',
        name: 'Logical Shift Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x47,
        asm: 'eor [$%.2x]',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x48,
        asm: 'pha',
        name: 'Push Accumulator',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 3
    },
    {
        id: 0x49,
        asm: 'eor #$%a8.x',  //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IMF,
        bytes: 2,
        cycles: 2
    {
        id: 0x4a,
        asm: 'lsr a',
        name: 'Logical Shift Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.IACC,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x4b,
        asm: 'phk',
        name: 'Push Program Bank Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 3
    },
    {
        id: 0x4c,
        asm: 'jmp $%.4x',
        name: 'Jump',
        mode: Opcodes.OPTYPE.ADDR_PC,
        bytes: 3,
        cycles: 3
    },
    {
        id: 0x4d,
        asm: 'eor $%.4x',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x4e,
        asm: 'lsr $%.4x',
        name: 'Logical Shift Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x4f,
        asm: 'eor $%.6x',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x50,
        asm: 'bvc $%.4x',
        name: 'Branch if Overflow Clear',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 2
    },
    {
        id: 0x51,
        asm: 'eor ($%.2x),y',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x52,
        asm: 'eor ($%.2x)',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x53,
        asm: 'eor ($%.2x,s),',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0x54,
        asm: 'mvn $%.2x,$%.2x',
        name: 'Block Move Negative',
        mode: Opcodes.OPTYPE.BLKMV,
        bytes: 3,
        cycles: 1
    },
    {
        id: 0x55,
        asm: 'eor $%.2x,x',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x56,
        asm: 'lsr $%.2x,x',
        name: 'Logical Shift Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x57,
        asm: 'eor [$%.2x],y',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x58,
        asm: 'cli',
        name: 'Clear Interrupt Disable Flag',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x59,
        asm: 'eor $%.4x,y',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x5a,
        asm: 'phy',
        name: 'Push Index Register Y',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 3
    },
    {
        id: 0x5b,
        asm: 'tcd',
        name: 'Transfer 16-bit Accumulator to Direct Page Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x5c,
        asm: 'jml $%.6x',
        name: 'Jump',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 4
    },
    {
        id: 0x5d,
        asm: 'eor $%.4x,x',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x5e,
        asm: 'lsr $%.4x,x',
        name: 'Logical Shift Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 7
    },
    {
        id: 0x5f,
        asm: 'eor $%.6x,',
        name: 'Exclusive-OR Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x60,
        asm: 'rts',
        name: 'Return from Subroutine',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 6
    },
    {
        id: 0x61,
        asm: 'adc ($%.2x,x)',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6 //Uses 3 cycles to shut the processor down: additional cycles are required by reset to restart it
    },
    {
        id: 0x62,
        asm: 'per $%.4x',
        name: 'Push Effective PC Relative Indirect Address',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x63,
        asm: 'adc $%.2x,s',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x64,
        asm: 'stz $%.2x',
        name: 'Store Zero to Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x65,
        asm: 'adc $%.2x',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x66,
        asm: 'ror $%.2x',
        name: 'Rotate Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x67,
        asm: 'adc [$%.2x]',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x68,
        asm: 'pla',
        name: 'Pull Accumulator',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 4
    },
    {
        id: 0x69,
        asm: 'adc #$%a8.x', //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.IIF,
        bytes: function() {
            return 2 + (regs.p.m ? 0 : 1);
        },
        cycles: 2
    {
        id: 0x6a,
        asm: 'ror a',
        name: 'Rotate Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.IACC,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x6b,
        asm: 'rtl',
        name: 'Return from Subroutine Long',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 6
    },
    {
        id: 0x6c,
        asm: 'jmp ($%.4x)',
        name: 'Jump',
        mode: Opcodes.OPTYPE.IADDR_PC,
        bytes: 3,
        cycles: 5
    },
    {
        id: 0x6d,
        asm: 'adc $%.4x',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x6e,
        asm: 'ror $%.4x',
        name: 'Rotate Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x6f,
        asm: 'adc $%.6x',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x70,
        asm: 'bvs $%.4x',
        name: 'Branch if Overflow Set',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 2
    },
    {
        id: 0x71,
        asm: 'adc ($%.2x),y',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: function(regs) {
            return 5; //Add 1 cycle if adding index crosses a page boundary...
        }
    },
    {
        id: 0x72,
        asm: 'adc ($%.2x)',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x73,
        asm: 'adc ($%.2x,s),',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0x74,
        asm: 'stz $%.2x,x',
        name: 'Store Zero to Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x75,
        asm: 'adc $%.2x,x',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x76,
        asm: 'ror $%.2x,x',
        name: 'Rotate Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x77,
        asm: 'adc [$%.2x],y',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x78,
        asm: 'sei',
        name: 'Set Interrupt Disable Flag',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x79,
        asm: 'adc $%.4x,y',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x7a,
        asm: 'ply',
        name: 'Pull Index Register Y',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 4
    },
    {
        id: 0x7b,
        asm: 'tdc',
        name: 'Transfer Direct Page Register to 16-bit Accumulator',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x7c,
        asm: 'jmp ($%.4x,x)',
        name: 'Jump',
        mode: Opcodes.OPTYPE.IADDRX,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0x7d,
        asm: 'adc $%.4x,x',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x7e,
        asm: 'ror $%.4x,x',
        name: 'Rotate Memory or Accumulator Right',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 7
    },
    {
        id: 0x7f,
        asm: 'adc $%.6x,',
        name: 'Add With Carry',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x80,
        asm: 'bra $%.4x',
        name: 'Branch Always',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x81,
        asm: 'sta ($%.2x,x)',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x82,
        asm: 'brl $%.4x',
        name: 'Branch Long Always',
        mode: Opcodes.OPTYPE.RELW,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x83,
        asm: 'sta $%.2x,s',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x84,
        asm: 'sty $%.2x',
        name: 'Store Index Register Y to Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x85,
        asm: 'sta $%.2x',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x86,
        asm: 'stx $%.2x',
        name: 'Store Index Register X to Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0x87,
        asm: 'sta [$%.2x]',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x88,
        asm: 'dey',
        name: 'Decrement Index Register Y',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x89,
        asm: 'bit #$%a8.x', //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'Test Bits',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 2,
        cycles: 2
    {
        id: 0x8a,
        asm: 'txa',
        name: 'Transfer Index Register X to Accumulator',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x8b,
        asm: 'phb',
        name: 'Push Data Bank Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 3
    },
    {
        id: 0x8c,
        asm: 'sty $%.4x',
        name: 'Store Index Register Y to Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x8d,
        asm: 'sta $%.4x',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x8e,
        asm: 'stx $%.4x',
        name: 'Store Index Register X to Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x8f,
        asm: 'sta $%.6x',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0x90,
        asm: 'bcc $%.4x',
        alias: 'blt',
        name: 'Branch if Carry Clear',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: function(regs) {
            //Add 1 cycle if branch is taken
            //Add 1 cycle if branch taken crosses page boundary in emulation mode (e=1)
            return 2 + (0) + (0);
        }
    },
    {
        id: 0x91,
        asm: 'sta ($%.2x),y',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x92,
        asm: 'sta ($%.2x)',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0x93,
        asm: 'sta ($%.2x,s),',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0x94,
        asm: 'sty $%.2x,x',
        name: 'Store Index Register Y to Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x95,
        asm: 'sta $%.2x,x',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x96,
        asm: 'stx $%.2x,y',
        name: 'Store Index Register X to Memory',
        mode: Opcodes.OPTYPE.DPY,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0x97,
        asm: 'sta [$%.2x],y',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0x98,
        asm: 'tya',
        name: 'Transfer Index Register Y to Accumulator',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x99,
        asm: 'sta $%.4x,y',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 5
    },
    {
        id: 0x9a,
        asm: 'txs',
        name: 'Transfer Index Register X to Stack Pointer',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x9b,
        asm: 'txy',
        name: 'Transfer Index Register X to Index Register Y',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0x9c,
        asm: 'stz $%.4x',
        name: 'Store Zero to Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0x9d,
        asm: 'sta $%.4x,x',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 5
    },
    {
        id: 0x9e,
        asm: 'stz $%.4x,x',
        name: 'Store Zero to Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 5
    },
    {
        id: 0x9f,
        asm: 'sta $%.6x,',
        name: 'Store Accumulator to Memory',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0xa0,
        asm: 'ldy #$%x8.x', //this will be %.2x if (regs.e || regs.p.x), %.4x otherwise
        name: 'Load Index Register Y from Memory',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 2,
        cycles: 2
    {
        id: 0xa1,
        asm: 'lda ($%.2x,x)',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xa2,
        asm: 'ldx #$%.2x', //this will be %.2x if (regs.e || regs.p.x), %.4x otherwise
        name: 'Load Index Register X from Memory',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 2,
        cycles: 2
    {
        id: 0xa3,
        asm: 'lda $%.2x,s',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xa4,
        asm: 'ldy $%.2x',
        name: 'Load Index Register Y from Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xa5,
        asm: 'lda $%.2x',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xa6,
        asm: 'ldx $%.2x',
        name: 'Load Index Register X from Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xa7,
        asm: 'lda [$%.2x]',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xa8,
        asm: 'tay',
        name: 'Transfer Accumulator to Index Register Y',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xa9,
        asm: 'lda #$%a8.x', //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 2,
        cycles: 2
    {
        id: 0xaa,
        asm: 'tax',
        name: 'Transfer Accumulator to Index Register X',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xab,
        asm: 'plb',
        name: 'Pull Data Bank Register',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 4
    },
    {
        id: 0xac,
        asm: 'ldy $%.4x',
        name: 'Load Index Register Y from Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xad,
        asm: 'lda $%.4x',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xae,
        asm: 'ldx $%.4x',
        name: 'Load Index Register X from Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xaf,
        asm: 'lda $%.6x',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0xb0,
        asm: 'bcs $%.4x',
        alias: 'bge',
        name: 'Branch if Carry Set',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 2
    },
    {
        id: 0xb1,
        asm: 'lda ($%.2x),y',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xb2,
        asm: 'lda ($%.2x)',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xb3,
        asm: 'lda ($%.2x,s),',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0xb4,
        asm: 'ldy $%.2x,x',
        name: 'Load Index Register Y from Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xb5,
        asm: 'lda $%.2x,x',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xb6,
        asm: 'ldx $%.2x,y',
        name: 'Load Index Register X from Memory',
        mode: Opcodes.OPTYPE.DPY,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xb7,
        asm: 'lda [$%.2x],y',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xb8,
        asm: 'clv',
        name: 'Clear Overflow Flag',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xb9,
        asm: 'lda $%.4x,y',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xba,
        asm: 'tsx',
        name: 'Transfer Stack Pointer to Index Register X',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xbb,
        asm: 'tyx',
        name: 'Transfer Index Register Y to Index Register X',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xbc,
        asm: 'ldy $%.4x,x',
        name: 'Load Index Register Y from Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xbd,
        asm: 'lda $%.4x,x',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xbe,
        asm: 'ldx $%.4x,y',
        name: 'Load Index Register X from Memory',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xbf,
        asm: 'lda $%.6x,',
        name: 'Load Accumulator from Memory',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0xc0,
        asm: 'cpy #$%x8.x', //this will be %.2x if (regs.e || regs.p.x), %.4x otherwise
        name: 'Compare Index Register Y with Memory',
        mode: Opcodes.OPTYPE.IMF,
        bytes: 2,
        cycles: 2
    {
        id: 0xc1,
        asm: 'cmp ($%.2x,x)',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xc2,
        asm: 'rep #$%.2x',
        name: 'Reset Processor Status Bits',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xc3,
        asm: 'cmp $%.2x,s',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xc4,
        asm: 'cpy $%.2x',
        name: 'Compare Index Register Y with Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xc5,
        asm: 'cmp $%.2x',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xc6,
        asm: 'dec $%.2x',
        name: 'Decrement',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xc7,
        asm: 'cmp [$%.2x]',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xc8,
        asm: 'iny',
        name: 'Increment Index Register Y',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xc9,
        asm: 'cmp #$%a8.x', //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.IACC,
        bytes: 2,
        cycles: 2
    {
        id: 0xca,
        asm: 'dex',
        name: 'Decrement Index Register X',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xcb,
        asm: 'wai',
        name: 'Wait for Interrupt',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 3 //Uses 3 cycles to shut the processor down: additional cycles are required by interrupt to restart it
    },
    {
        id: 0xcc,
        asm: 'cpy $%.4x',
        name: 'Compare Index Register Y with Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xcd,
        asm: 'cmp $%.4x',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xce,
        asm: 'dec $%.4x',
        name: 'Decrement',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0xcf,
        asm: 'cmp $%.6x',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0xd0,
        asm: 'bne $%.4x',
        name: 'Branch if Not Equal',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 2
    },
    {
        id: 0xd1,
        asm: 'cmp ($%.2x),y',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xd2,
        asm: 'cmp ($%.2x)',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xd3,
        asm: 'cmp ($%.2x,s),',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0xd4,
        asm: 'pei ($%.2x)',
        name: 'Push Effective Indirect Address',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xd5,
        asm: 'cmp $%.2x,x',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xd6,
        asm: 'dec $%.2x,x',
        name: 'Decrement',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xd7,
        asm: 'cmp [$%.2x],y',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xd8,
        asm: 'cld',
        name: 'Clear Decimal Mode Flag',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xd9,
        asm: 'cmp $%.4x,y',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xda,
        asm: 'phx',
        name: 'Push Index Register X',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 1,
        cycles: 3
    },
    {
        id: 0xdb,
        asm: 'stp',
        name: 'Stop Processor',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 3 //Uses 3 cycles to shut the processor down: additional cycles are required by reset to restart it
    },
    {
        id: 0xdc,
        asm: 'jmp [$%.4x]',
        alias: 'jml',
        name: 'Jump',
        mode: Opcodes.OPTYPE.ILADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0xdd,
        asm: 'cmp $%.4x,x',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xde,
        asm: 'dec $%.4x,x',
        name: 'Decrement',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 7
    },
    {
        id: 0xdf,
        asm: 'cmp $%.6x,',
        name: 'Compare Accumulator with Memory',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0xe0,
        asm: 'cpx #$%x8.x', //this will be %.2x if (regs.e || regs.p.x), %.4x otherwise
        name: 'Compare Index Register X with Memory',
        mode: Opcodes.OPTYPE.IMF,
        bytes: function(regs) {
            //Add 1 byte if x=0 (16-bit index registers)
            return 2 + (regs.p.x ? 0 + 1);
        },
        cycles: function (regs) {
            //Add 1 cycle if x=0 (16-bit index registers)
            return 2 + (regs.p.x ? 0 : 1);
        }
    {
        id: 0xe1,
        asm: 'sbc ($%.2x,x)',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.IDPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xe2,
        asm: 'sep #$%.2x',
        name: 'Set Processor Status Bits',
        mode: Opcodes.OPTYPE.IMF,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xe3,
        asm: 'sbc $%.2x,s',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.SR,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xe4,
        asm: 'cpx $%.2x',
        name: 'Compare Index Register X with Memory',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xe5,
        asm: 'sbc $%.2x',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 3
    },
    {
        id: 0xe6,
        asm: 'inc $%.2x',
        name: 'Increment',
        mode: Opcodes.OPTYPE.DP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xe7,
        asm: 'sbc [$%.2x]',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.ILDP,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xe8,
        asm: 'inx',
        name: 'Increment Index Register X',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xe9,
        asm: 'sbc #$%a8.x', //this will be %.2x if (regs.e || regs.p.m), %.4x otherwise
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 2,
        cycles: 2
    {
        id: 0xea,
        asm: 'nop',
        name: 'No Operation',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xeb,
        asm: 'xba',
        name: 'Exchange B and A 8-bit Accumulators',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 1,
        cycles: 3
    },
    {
        id: 0xec,
        asm: 'cpx $%.4x',
        name: 'Compare Index Register X with Memory',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xed,
        asm: 'sbc $%.4x',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xee,
        asm: 'inc $%.4x',
        name: 'Increment',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 6
    },
    {
        id: 0xef,
        asm: 'sbc $%.6x',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.LONG,
        bytes: 4,
        cycles: 5
    },
    {
        id: 0xf0,
        asm: 'beq $%.4x',
        name: 'Branch if Equal',
        mode: Opcodes.OPTYPE.RELB,
        bytes: 2,
        cycles: 2
    },
    {
        id: 0xf1,
        asm: 'sbc ($%.2x),y',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.IDPY,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xf2,
        asm: 'sbc ($%.2x)',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.IDP,
        bytes: 2,
        cycles: 5
    },
    {
        id: 0xf3,
        asm: 'sbc ($%.2x,s),',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.ISRY,
        bytes: 2,
        cycles: 7
    },
    {
        id: 0xf4,
        asm: 'pea $%.4x',
        name: 'Push Effective Absolute Address',
        mode: Opcodes.OPTYPE.ADDR,
        bytes: 3,
        cycles: 5
    },
    {
        id: 0xf5,
        asm: 'sbc $%.2x,x',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 4
    },
    {
        id: 0xf6,
        asm: 'inc $%.2x,x',
        name: 'Increment',
        mode: Opcodes.OPTYPE.DPX,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xf7,
        asm: 'sbc [$%.2x],y',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.ILDPY,
        bytes: 2,
        cycles: 6
    },
    {
        id: 0xf8,
        asm: 'sed',
        name: 'Set Decimal Flag',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xf9,
        asm: 'sbc $%.4x,y',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.ADDRY,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xfa,
        asm: 'plx',
        name: 'Pull Index Register X',
        mode: Opcodes.OPTYPE.IIF,
        bytes: 1,
        cycles: 4
    },
    {
        id: 0xfb,
        asm: 'xce',
        name: 'Exchange Carry and Emulation Flags',
        mode: Opcodes.OPTYPE.IMP,
        bytes: 1,
        cycles: 2
    },
    {
        id: 0xfc,
        asm: 'jsr ($%.4x,x)',
        name: 'Jump to Subroutine',
        mode: Opcodes.OPTYPE.IADDRX,
        bytes: 3,
        cycles: 8
    },
    {
        id: 0xfd,
        asm: 'sbc $%.4x,x',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 4
    },
    {
        id: 0xfe,
        asm: 'inc $%.4x,x',
        name: 'Increment',
        mode: Opcodes.OPTYPE.ADDRX,
        bytes: 3,
        cycles: 7
    },
    {
        id: 0xff,
        asm: 'sbc $%.6x,',
        name: 'Subtract with Borrow from Accumulator',
        mode: Opcodes.OPTYPE.LONGX,
        bytes: 4,
        cycles: 5
    }
];