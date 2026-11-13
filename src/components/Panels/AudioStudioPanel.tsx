import React from 'react';
import { AudioProperties } from '../../types/editor';
import { VOICE_PRESETS } from '../../constants/presets';
import { updateEqualizer, applyVoicePreset, playSoundEffect, setAudioDucking } from '../../utils/audioEngine';
import { Volume2, VolumeX, Sliders, Music, Mic, Wand2, Play } from 'lucide-react';

interface AudioStudioPanelProps {
  audio: AudioProperties;
  onChange: (updated: AudioProperties) => void;
}

export const AudioStudioPanel: React.FC<AudioStudioPanelProps> = ({
  audio,
  onChange,
}) => {
  const handleVolumeChange = (vol: number) => {
    onChange({ ...audio, volume: vol });
  };

  const handleMuteToggle = () => {
    onChange({ ...audio, mute: !audio.mute });
  };

  const handleEqChange = (band: 'bass' | 'mid' | 'treble', val: number) => {
    const updatedEq = { ...audio.equalizer, [band]: val };
    onChange({ ...audio, equalizer: updatedEq });
    updateEqualizer(updatedEq.bass, updatedEq.mid, updatedEq.treble);
  };

  const handleVoicePresetSelect = (presetId: AudioProperties['voicePreset']) => {
    const preset = VOICE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const updated = {
        ...audio,
        voicePreset: presetId,
        equalizer: { ...preset.eq },
        reverb: preset.reverb,
      };
      onChange(updated);
      applyVoicePreset(presetId);
    }
  };

  const handleDuckingToggle = () => {
    const nextState = !audio.autoDucking;
    onChange({ ...audio, autoDucking: nextState });
    setAudioDucking(nextState);
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Top Gain & Mute Section */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-lg transition-colors ${
              audio.mute ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {audio.mute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00CFFF]" />}
          </button>
          <div>
            <div className="text-xs font-semibold text-white">Track Volume Gain</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {audio.mute ? 'MUTED' : `${Math.round(audio.volume * 100)}% (+${((audio.volume - 1) * 6).toFixed(1)} dB)`}
            </div>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          disabled={audio.mute}
          value={audio.volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-36 accent-[#00CFFF]"
        />
      </div>

      {/* Smart Audio Ducking */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#00CFFF]" /> Smart Audio Ducking
          </div>
          <div className="text-[11px] text-slate-400">
            Automatically lowers background music when voice dialogue is active
          </div>
        </div>
        <button
          onClick={handleDuckingToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            audio.autoDucking
              ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF]'
              : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
          }`}
        >
          {audio.autoDucking ? 'Enabled' : 'Bypass'}
        </button>
      </div>

      {/* Voice Processing Presets */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Voice Character Presets (Natural Acoustic)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VOICE_PRESETS.map((vp) => (
            <button
              key={vp.id}
              onClick={() => handleVoicePresetSelect(vp.id)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                audio.voicePreset === vp.id
                  ? 'border-[#00CFFF] bg-[#00CFFF]/15 text-white'
                  : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs flex items-center justify-between">
                <span>{vp.label}</span>
                {audio.voicePreset === vp.id && <span className="text-[#00CFFF] text-[10px]">ACTIVE</span>}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{vp.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3-Band Parametric Equalizer */}
      <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#00CFFF]" /> 3-Band Studio Equalizer
        </span>

        {/* Bass */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Bass Low Shelf (250 Hz)</span>
            <span className="font-mono text-cyan-400">{audio.equalizer.bass > 0 ? `+${audio.equalizer.bass}` : audio.equalizer.bass} dB</span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={audio.equalizer.bass}
            onChange={(e) => handleEqChange('bass', parseInt(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Mid */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Mid Presence (1.5 kHz)</span>
            <span className="font-mono text-cyan-400">{audio.equalizer.mid > 0 ? `+${audio.equalizer.mid}` : audio.equalizer.mid} dB</span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={audio.equalizer.mid}
            onChange={(e) => handleEqChange('mid', parseInt(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Treble */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Treble Air (4 kHz)</span>
            <span className="font-mono text-cyan-400">{audio.equalizer.treble > 0 ? `+${audio.equalizer.treble}` : audio.equalizer.treble} dB</span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={audio.equalizer.treble}
            onChange={(e) => handleEqChange('treble', parseInt(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>
      </div>

      {/* Cinematic SFX Trigger Pad */}
      <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Cinematic Sound FX Pad (Preview)
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'whoosh', label: 'Whoosh Transition' },
            { id: 'hit', label: 'Sub-Bass Hit' },
            { id: 'shutter', label: 'Camera Shutter' },
          ].map((sfx) => (
            <button
              key={sfx.id}
              onClick={() => playSoundEffect(sfx.id as any)}
              className="p-2 rounded-lg bg-[#111827] border border-slate-800 hover:border-[#00CFFF] text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 text-[11px]"
            >
              <Play className="w-3 h-3 text-[#00CFFF]" />
              <span>{sfx.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
