var NL2={};

NL2.lightsOff=[0xf0,0x00,0x20,0x29,0x02,0x18,0x0e,0x00,0xf7];
NL2.chan={
  "[Channel1]": 0,
  "[Channel2]": 1,
  "[Channel3]": 2,
  "[Channel4]": 3,
};
NL2.sample={
  "[Sampler1]": 0,
  "[Sampler2]": 1,
  "[Sampler3]": 2,
  "[Sampler4]": 3,
  "[Sampler5]": 4,
  "[Sampler6]": 5,
  "[Sampler7]": 6,
  "[Sampler8]": 7,
  "[Sampler9]": 0,
  "[Sampler10]": 1,
  "[Sampler11]": 2,
  "[Sampler12]": 3,
  "[Sampler13]": 4,
  "[Sampler14]": 5,
  "[Sampler15]": 6,
  "[Sampler16]": 7
};
NL2.hotCueCtrls={
  "hotcue_1_enabled": 0,
  "hotcue_2_enabled": 1,
  "hotcue_3_enabled": 2,
  "hotcue_4_enabled": 3,
  "hotcue_5_enabled": 4,
  "hotcue_6_enabled": 5,
  "hotcue_7_enabled": 6,
  "hotcue_8_enabled": 7
};
NL2.padCMap={
  51: 0, 71: 0, 55: 0, 75: 0,
  52: 1, 72: 1, 56: 1, 76: 1,
  53: 2, 73: 2, 57: 2, 77: 2,
  54: 3, 74: 3, 58: 3, 78: 3,
  41: 4, 61: 4, 45: 4, 65: 4,
  42: 5, 62: 5, 46: 5, 66: 5,
  43: 6, 63: 6, 47: 6, 67: 6,
  44: 7, 64: 7, 48: 7, 68: 7
};
NL2.crossValues=[-1,-0.67,-0.33,0,0.33,0.67,1];
NL2.shift=false;
NL2.modeChan=0;
NL2.modePrompt=0;
NL2.modeHighHN=0;
NL2.modes=[0,0,0,0];
NL2.modeConns=[
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null]
];
NL2.padLights=[
  [71,72,73,74,61,62,63,64],
  [75,76,77,78,65,66,67,68],
  [51,52,53,54,41,42,43,44],
  [55,56,57,58,45,46,47,48]
];
NL2.page0Controls=[
  "slip_enabled",
  "repeat",
  "beats_translate_curpos",
  null,
  "eject",
  "quantize",
  "keylock",
  null
];
NL2.page0Hold=[
  true, true, false, true,
  false, true, true, true
];
NL2.loopSizes=['0.03125','0.0625','0.125','0.25','0.5','1','2','4','8','16','32','64'];
NL2.beatJumpSizes=[-0.25,-0.5,-1,-2,0.25,0.5,1,2];
NL2.hotCueColors=[5,13,45,17,87,49,37,81];

NL2.init=function() {
  NL2.connectControls();
}

NL2.shutdown=function() {
  midi.sendSysexMsg(NL2.lightsOff,NL2.lightsOff.length);
}

NL2.connectControls=function() {
  var conn;
  // per-deck conns
  for (i=0; i<4; i++) {
    conn=engine.makeConnection("[Channel"+(i+1)+"]","play_indicator",NL2.lightPlay);
    conn.trigger();
    conn=engine.makeConnection("[Channel"+(i+1)+"]","cue_indicator",NL2.lightCue);
    conn.trigger();
    conn=engine.makeConnection("[Channel"+(i+1)+"]","slip_enabled",NL2.lightSlip);
    conn.trigger();
    conn=engine.makeConnection("[Channel"+(i+1)+"]","beat_active",NL2.lightSyncBeat);
    conn.trigger();
  }
  
  // sample conns
  for (i=0; i<8; i++) {
    conn=engine.makeConnection("[Sampler"+(i+1)+"]","play",NL2.lightSample);
    conn.trigger();
    conn=engine.makeConnection("[Sampler"+(i+1)+"]","track_loaded",NL2.lightInsSample);
    conn.trigger();
  }
  
  for (i=0; i<8; i++) {
    conn=engine.makeConnection("[Sampler"+(i+9)+"]","play",NL2.lightSample2);
    conn.trigger();
    conn=engine.makeConnection("[Sampler"+(i+9)+"]","track_loaded",NL2.lightInsSample2);
    conn.trigger();
  }
  
  for (i=0; i<4; i++) {
    NL2.padConns(i);
  }
  
  conn=engine.makeConnection("[Master]","crossfader",NL2.lightCross);
  conn.trigger();
  
  NL2.lightModeChan();
}

NL2.padConns=function(channel) {
  for (i=0; i<8; i++) {
    midi.sendShortMsg(0x90,NL2.padLights[channel][i],0);
    if (NL2.modeConns[channel][i]!=null) {
      NL2.modeConns[channel][i].disconnect();
      NL2.modeConns[channel][i]=null;
    }
  }
  switch (NL2.modes[channel]) {
    case 0:
      NL2.modeConns[channel][0]=engine.makeConnection("[Channel"+(channel+1)+"]","slip_enabled",NL2.lightGeneric0);
      NL2.modeConns[channel][0].trigger();
      NL2.modeConns[channel][1]=engine.makeConnection("[Channel"+(channel+1)+"]","repeat",NL2.lightGeneric1);
      NL2.modeConns[channel][1].trigger();
      NL2.modeConns[channel][2]=engine.makeConnection("[Channel"+(channel+1)+"]","beats_translate_curpos",NL2.lightGeneric2);
      NL2.modeConns[channel][2].trigger();
      //NL2.modeConns[channel][3]=engine.makeConnection("[EffectRack1_EffectUnit1]","group_[Channel"+(channel+1)+"]_enable",NL2.lightGeneric3);
      //NL2.modeConns[channel][3].trigger();
      NL2.modeConns[channel][4]=engine.makeConnection("[Channel"+(channel+1)+"]","eject",NL2.lightGeneric4);
      NL2.modeConns[channel][4].trigger();
      NL2.modeConns[channel][5]=engine.makeConnection("[Channel"+(channel+1)+"]","quantize",NL2.lightGeneric5);
      NL2.modeConns[channel][5].trigger();
      NL2.modeConns[channel][6]=engine.makeConnection("[Channel"+(channel+1)+"]","keylock",NL2.lightGeneric6);
      NL2.modeConns[channel][6].trigger();
      //NL2.modeConns[channel][7]=engine.makeConnection("[EffectRack1_EffectUnit2]","group_[Channel"+(channel+1)+"]_enable",NL2.lightGeneric7);
      //NL2.modeConns[channel][7].trigger();
      break;
    case 4:
      for (i=0; i<8; i++) {
        NL2.modeConns[channel][i]=engine.makeConnection("[Channel"+(channel+1)+"]","hotcue_"+(i+1)+"_enabled",NL2.lightPadHotCue);
        NL2.modeConns[channel][i].trigger();
      }
      break;
    case 5:
      for (i=0; i<8; i++) {
        NL2.modeConns[channel][i]=engine.makeConnection("[Channel"+(channel+1)+"]","beatloop_"+(NL2.loopSizes[i+1])+"_enabled",NL2.lightPadRoll);
        NL2.modeConns[channel][i].trigger();
      }
      break;
    case 12:
      for (i=0; i<8; i++) {
        midi.sendShortMsg(0x90,NL2.padLights[channel][i],(engine.getValue("[Sampler"+(i+1)+"]","track_loaded")==true)?112:0);
      }
    case 13:
      for (i=0; i<8; i++) {
        midi.sendShortMsg(0x90,NL2.padLights[channel][i],(engine.getValue("[Sampler"+(i+9)+"]","track_loaded")==true)?112:0);
      }
  }
}

NL2.lightPlay=function(value,group,control) {
  midi.sendShortMsg(0x90,0x0c+NL2.chan[group]*2,value?21:0);
}

NL2.lightCue=function(value,group,control) {
  midi.sendShortMsg(0x90,0x0b+NL2.chan[group]*2,value?9:15);
}

NL2.lightSlip=function(value,group,control) {
  midi.sendShortMsg(0x90,0x15+NL2.chan[group]*2,value?5:0);
}

NL2.lightSyncBeat=function(value,group,control) {
  midi.sendShortMsg(0x90,0x16+NL2.chan[group]*2,value?38:(engine.getValue(group,"sync_enabled")?46:0));
}

NL2.lightPadHotCue=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][NL2.hotCueCtrls[control]],value?(NL2.hotCueColors[NL2.hotCueCtrls[control]]):0);
}

NL2.lightPadRoll=function(value,group,control) {
  for (var i=0; i<8; i++) {
    if (control==='beatloop_'+NL2.loopSizes[i+1]+'_enabled') {
      midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][i],value?25:0);
      break;
    }
  }
}

NL2.lightGeneric0=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][0],value?80:0);
}
NL2.lightGeneric1=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][1],value?80:0);
}
NL2.lightGeneric2=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][2],value?80:0);
}
NL2.lightGeneric3=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][3],value?80:0);
}
NL2.lightGeneric4=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][4],value?80:0);
}
NL2.lightGeneric5=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][5],value?80:0);
}
NL2.lightGeneric6=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][6],value?80:0);
}
NL2.lightGeneric7=function(value,group,control) {
  midi.sendShortMsg(0x90,NL2.padLights[NL2.chan[group]][7],value?80:0);
}

NL2.lightSample=function(value,group,control) {
  for (var i=0; i<4; i++) {
    if (NL2.modes[i]==12) {
      midi.sendShortMsg(0x90,NL2.padLights[i][NL2.sample[group]],value?(5+(Math.floor(Math.random()*7)*8)):112);
    }
  }
}

NL2.lightSample2=function(value,group,control) {
  for (var i=0; i<4; i++) {
    if (NL2.modes[i]==13) {
      midi.sendShortMsg(0x90,NL2.padLights[i][NL2.sample[group]],value?(5+(Math.floor(Math.random()*7)*8)):112);
    }
  }
}

NL2.lightInsSample=function(value,group,control) {
  for (var i=0; i<4; i++) {
    if (NL2.modes[i]==12) {
      midi.sendShortMsg(0x90,NL2.padLights[i][NL2.sample[group]],value?112:0);
    }
  }
}

NL2.lightInsSample2=function(value,group,control) {
  for (var i=0; i<4; i++) {
    if (NL2.modes[i]==13) {
      midi.sendShortMsg(0x90,NL2.padLights[i][NL2.sample[group]],value?112:0);
    }
  }
}

NL2.lightCross=function(value,group,control) {
  for (var i=0; i<7; i++) {
    midi.sendShortMsg(0x90,0x52+i,(Math.floor(3.49*(value+1))==i)?33:47);
  }
}

NL2.lightModeChan=function() {
  for (i=0; i<4; i++) {
    midi.sendShortMsg(0xb0,0x6c+i,(NL2.modeChan==i)?6:0);
    
    // current mode light
    if (((NL2.modes[NL2.modeChan]>>2)==i) && ((NL2.modes[NL2.modeChan]&3)==i)) {
      midi.sendShortMsg(0xb0,0x68+i,90);
    } else if ((NL2.modes[NL2.modeChan]>>2)==i) {
      midi.sendShortMsg(0xb0,0x68+i,21);
    } else if ((NL2.modes[NL2.modeChan]&3)==i) {
      midi.sendShortMsg(0xb0,0x68+i,45);
    } else {
      midi.sendShortMsg(0xb0,0x68+i,0);
    }
  }
}

NL2.setCrossfader=function(group,control,value) {
  if (value) {
    engine.setValue("[Master]","crossfader",NL2.crossValues[control-0x52]);
  }
  //midi.sendShortMsg(0x90,0x0b+NL2.chan[group]*2,value?9:0);
}

NL2.setModeChan=function(group,control,value) {
  if (value) {
    NL2.modeChan=control-0x6c;
    NL2.modePrompt=0;
    NL2.lightModeChan();
  }
}

NL2.setMode=function(group,control,value) {
  if (value) {
    if (NL2.modePrompt) {
      NL2.modePrompt=0;
      NL2.modes[NL2.modeChan]=NL2.modeHighHN<<2|(control-0x68);
      NL2.lightModeChan();
      NL2.padConns(NL2.modeChan);
    } else {
      NL2.modePrompt=1;
      NL2.modeHighHN=control-0x68;
      midi.sendShortMsg(0xb1,control,13);
    }
  }
}

NL2.padPress=function(group,control,value,asdf,agroup) {
  switch (NL2.modes[NL2.chan[agroup]]) {
    case 0:
      // to be fixed for some buttons
      if (NL2.page0Hold[NL2.padCMap[control]]) {
        if (value) {
          engine.setValue(agroup,NL2.page0Controls[NL2.padCMap[control]],!engine.getValue(agroup,NL2.page0Controls[NL2.padCMap[control]]));
        }
      } else {
        engine.setValue(agroup,NL2.page0Controls[NL2.padCMap[control]],value?1:0);
      }
      break;
    case 4:
      if (NL2.shift) {
        engine.setValue(agroup,"hotcue_"+(NL2.padCMap[control]+1)+"_clear",value?1:0);
      } else {
        engine.setValue(agroup,"hotcue_"+(NL2.padCMap[control]+1)+"_activate",value?1:0);
      }
      break;
    case 5:
      engine.setValue(agroup,"beatlooproll_"+NL2.loopSizes[NL2.padCMap[control]+1]+"_activate",value?1:0);
      break;
    case 6:
      if (value) {
        engine.setValue(agroup,"beatjump",NL2.beatJumpSizes[NL2.padCMap[control]]);
      }
      break;
    case 12:
      if (NL2.shift) {
        engine.setValue("[Sampler"+(NL2.padCMap[control]+1)+"]","start_stop",value?1:0);
      } else {
        engine.setValue("[Sampler"+(NL2.padCMap[control]+1)+"]","start_play",value?1:0);
      }
      break;
    case 13:
      if (NL2.shift) {
        engine.setValue("[Sampler"+(NL2.padCMap[control]+9)+"]","start_stop",value?1:0);
      } else {
        engine.setValue("[Sampler"+(NL2.padCMap[control]+9)+"]","start_play",value?1:0);
      }
      break;
  }
}

NL2.shiftKey=function(group,control,value) {
  if (value) {
    NL2.shift=true;
  } else {
    NL2.shift=false;
  }
  midi.sendShortMsg(0x90,0x13,NL2.shift?5:0);
}

NL2.syncEnable=function(group,control,value,asdf,agroup) {
  if (value) {
    engine.setValue(agroup,"sync_enabled",!NL2.shift);
  }
  midi.sendShortMsg(0x90,control,engine.getValue(agroup,"sync_enabled")?46:0);
}

NL2.cueButton=function(group,control,value,asdf,agroup) {
  if (NL2.shift) {
    engine.setValue(agroup,"start",value);
  } else {
    engine.setValue(agroup,"cue_default",value);
  }
}
