/* assessment.js
   NeuroSynapse‑PD (GitHub Pages friendly)
   - Languages: EN / HI / RU from window.NS_I18N (defined in index.html)
   - Voice prompts via SpeechSynthesisUtterance.lang [web:41]
   - Real signal capture (no random numbers):
        Voice: MediaRecorder audio blobs (3 trials + playback) [web:85]
        Tremor: DeviceMotionEvent acceleration magnitude (frequency + RMS amplitude) [web:148]
        Gait: MediaPipe Pose skeleton overlay; cadence proxy from ankle vertical oscillation [web:47]
        Facial: MediaPipe FaceMesh overlay; blink rate proxy using eye aspect ratio [web:60]
   - Results: Table + Radar chart (Chart.js) + downloads (PNG + PDF) [web:81][web:82]
*/

(function () {
  "use strict";

  /* ------------------------------
     Global state
  ------------------------------ */
  const APP = {
    lang: (window.NS_APP_BOOT && window.NS_APP_BOOT.defaultLang) || "en",
    voiceEnabled: true,
    tremorUI: false,

    patient: null,

    completed: { voice: false, tremor: false, gait: false, facial: false },
    scores: { voice: null, tremor: null, gait: null, facial: null }, // 0..4 domain severity proxies (NOT UPDRS)
    metrics: { voice: null, tremor: null, gait: null, facial: null }, // raw computed features

    // voice trials
    voiceTrials: [
      { blob: null, url: null, ok: false },
      { blob: null, url: null, ok: false },
      { blob: null, url: null, ok: false }
    ],
    voice: {
      recording: false,
      rec: null,
      stream: null,
      chunks: [],
      trialIndex: 0,
      durationSec: 8
    },

    // tremor
    tremor: {
      running: false,
      hand: "right",
      durationSec: 20,
      samples: [], // {t, mag}
      listener: null
    },

    // cameras
    cams: {
      gait: { stream: null, facing: "user", mp: null, camera: null, running: false, durationSec: 15 },
      face: { stream: null, facing: "user", mp: null, camera: null, running: false, durationSec: 10 }
    },

    // chart
    radar: { chart: null }
  };

  const $ = (id) => document.getElementById(id);

  /* ------------------------------
     Utilities
  ------------------------------ */
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  window.addEventListener("resize", setVH);
  window.addEventListener("orientationchange", setVH);

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  function nowMs() { return performance.now(); }

  function fmtTimer(sec) {
    const s = Math.max(0, Math.round(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function toast(message) {
    const el = document.createElement("div");
    el.textContent = message;
    el.style.position = "fixed";
    el.style.right = "1rem";
    el.style.bottom = "1rem";
    el.style.zIndex = "9999";
    el.style.padding = "0.85rem 1rem";
    el.style.borderRadius = "14px";
    el.style.background = "rgba(0,0,0,0.78)";
    el.style.border = "1px solid rgba(255,255,255,0.14)";
    el.style.color = "#fff";
    el.style.fontFamily = "Inter, system-ui, sans-serif";
    el.style.maxWidth = "min(380px, calc(100vw - 2rem))";
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 240ms ease"; }, 1600);
    setTimeout(() => el.remove(), 1900);
  }

  /* ------------------------------
     Language + i18n
  ------------------------------ */
  function dict() {
    const d = (window.NS_I18N && window.NS_I18N[APP.lang]) || (window.NS_I18N && window.NS_I18N.en) || {};
    return d;
  }

  function langTTS() {
    // For SpeechSynthesisUtterance.lang [web:41]
    if (APP.lang === "hi") return "hi-IN";
    if (APP.lang === "ru") return "ru-RU";
    return "en-US";
  }

  function translatePage() {
    const d = dict();
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      if (d[key] !== undefined) el.innerHTML = d[key];
    });

    const label = APP.lang === "hi" ? "हिन्दी" : APP.lang === "ru" ? "Русский" : "English";
    if ($("currentLanguageLabel")) $("currentLanguageLabel").textContent = label;

    ["languageSelect", "topLanguageSelect", "dashboardLanguageSelect"].forEach(id => {
      const s = $(id);
      if (s && s.value !== APP.lang) s.value = APP.lang;
    });

    // dangles
    if ($("voiceDangleText")) $("voiceDangleText").textContent = APP.voiceEnabled ? (d.voiceOn || "Voice: Ready") : (d.voiceOff || "Voice: Off");
    if ($("tremorDangleText")) $("tremorDangleText").textContent = APP.tremorUI ? (d.tremorOn || "Anti‑Tremor: On") : (d.tremorOff || "Anti‑Tremor: Off");
  }

  function setLanguage(lang) {
    APP.lang = (lang === "hi" || lang === "ru" || lang === "en") ? lang : "en";
    translatePage();
    speak(APP.lang === "hi" ? "भाषा बदल दी गई।" : APP.lang === "ru" ? "Язык изменён." : "Language changed.");
  }

  /* ------------------------------
     Voice prompts
  ------------------------------ */
  function speak(text) {
    if (!APP.voiceEnabled) return;
    if (!("speechSynthesis" in window)) return;
    const t = String(text || "").replace(/<[^>]*>/g, "").trim();
    if (!t) return;

    const u = new SpeechSynthesisUtterance(t);
    u.lang = langTTS();
    // Let browser choose the best voice for lang; avoid fragile manual selection.
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function speakForTest(testKey) {
    const m = {
      voice: {
        en: "Speech screening. You will do three recordings. Read the sentence clearly when the countdown ends.",
        hi: "स्पीच स्क्रीनिंग। तीन रिकॉर्डिंग होंगी। काउंटडाउन के बाद वाक्य स्पष्ट पढ़ें।",
        ru: "Скрининг речи. Будет три записи. Чётко прочитайте фразу после обратного отсчёта."
      },
      tremor: {
        en: "Tremor screening. Rest your hand on a stable surface. Keep still during the measurement.",
        hi: "कंपन स्क्रीनिंग। हाथ को स्थिर सतह पर रखें। मापन के दौरान स्थिर रहें।",
        ru: "Скрининг тремора. Положите руку на устойчивую поверхность. Не двигайтесь во время измерения."
      },
      gait: {
        en: "Gait screening. Walk naturally in front of the camera for fifteen seconds.",
        hi: "गैट स्क्रीनिंग। पंद्रह सेकंड तक कैमरे के सामने सामान्य रूप से चलें।",
        ru: "Скрининг походки. Идите естественно перед камерой пятнадцать секунд."
      },
      facial: {
        en: "Facial screening. Look at the camera with a neutral face. Try not to move.",
        hi: "चेहरे की स्क्रीनिंग। कैमरे की ओर देखें और चेहरा सामान्य रखें।",
        ru: "Скрининг мимики. Смотрите в камеру с нейтральным выражением лица."
      }
    };
    const pack = m[testKey] || m.voice;
    speak(pack[APP.lang] || pack.en);
  }

  /* ------------------------------
     Navigation + locking
  ------------------------------ */
  function setNavLocked(viewName, locked) {
    const item = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (!item) return;
    if (locked) item.setAttribute("disabled", "");
    else item.removeAttribute("disabled");
  }

  function isLocked(viewName) {
    const item = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    return item ? item.hasAttribute("disabled") : false;
  }

  function setActiveNav(viewName) {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const item = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (item) item.classList.add("active");
  }

  function closeSidebarOnMobile() {
    const sidebar = $("sidebar");
    if (sidebar) sidebar.classList.remove("open");
  }

  function showView(viewName) {
    if (isLocked(viewName)) {
      toast(dict().fillCorrect || "Please complete required info.");
      speak(dict().fillCorrect || "Please complete required info.");
      return;
    }

    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    const view = $(`${viewName}View`);
    if (view) view.classList.add("active");
    setActiveNav(viewName);
    closeSidebarOnMobile();

    if (viewName === "results") renderResults();
    if (viewName === "report") renderReport();

    if (["voice","tremor","gait","facial"].includes(viewName)) {
      speakForTest(viewName);
    }
  }

  /* ------------------------------
     Splash
  ------------------------------ */
  function initSplash() {
    const splash = $("splashScreen");
    const bar = $("splashProgress");
    if (!splash || !bar) return;

    let p = 0;
    const timer = setInterval(() => {
      p += 3;
      bar.style.width = Math.min(100, p) + "%";
      if (p >= 100) {
        clearInterval(timer);
        splash.style.opacity = "0";
        splash.style.pointerEvents = "none";
        setTimeout(() => splash.remove(), 450);
        showView("info");
        speak("Welcome to NeuroSynapse‑PD.");
      }
    }, 40);
  }

  /* ------------------------------
     Sidebar / Language / Toggles
  ------------------------------ */
  function initChrome() {
    // sidebar buttons
    const menuToggle = $("menuToggle");
    const sidebarBack = $("sidebarBack");
    const sidebar = $("sidebar");
    if (menuToggle && sidebar) menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    if (sidebarBack && sidebar) sidebarBack.addEventListener("click", () => sidebar.classList.remove("open"));

    // nav click
    document.querySelectorAll(".nav-item[data-view]").forEach(it => {
      it.addEventListener("click", () => {
        const v = it.getAttribute("data-view");
        if (v) showView(v);
      });
    });
    document.querySelectorAll("button[data-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-view");
        if (v) showView(v);
      });
    });

    // language selects
    ["languageSelect","topLanguageSelect","dashboardLanguageSelect"].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener("change", (e) => setLanguage(e.target.value));
    });

    // toggles
    const voiceToggle = $("voiceToggle");
    if (voiceToggle) {
      voiceToggle.addEventListener("click", () => {
        APP.voiceEnabled = !APP.voiceEnabled;
        voiceToggle.classList.toggle("active", APP.voiceEnabled);
        voiceToggle.setAttribute("aria-checked", APP.voiceEnabled ? "true" : "false");
        translatePage();
        speak(APP.voiceEnabled ? "Voice on." : "Voice off.");
      });
    }
    const tremorToggle = $("tremorToggle");
    if (tremorToggle) {
      tremorToggle.addEventListener("click", async () => {
        APP.tremorUI = !APP.tremorUI;
        tremorToggle.classList.toggle("active", APP.tremorUI);
        tremorToggle.setAttribute("aria-checked", APP.tremorUI ? "true" : "false");
        translatePage();
        if (APP.tremorUI) await requestMotionPermissionIfNeeded();
      });
    }
  }

  /* ------------------------------
     Patient form unlock logic
  ------------------------------ */
  function initPatientForm() {
    const form = $("patientForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const firstName = ($("firstName")?.value || "").trim();
      const lastName  = ($("lastName")?.value || "").trim();
      const dob       = $("dateOfBirth")?.value || "";
      const gender    = $("gender")?.value || "";
      const cc        = $("countryCode")?.value || "";
      const phone     = ($("phoneNumber")?.value || "").trim();
      const email     = ($("email")?.value || "").trim();
      const medicalId = ($("medicalId")?.value || "").trim();

      ["firstNameError","lastNameError","dobError","genderError","countryError","phoneError","emailError"].forEach(id => { if ($(id)) $(id).textContent = ""; });

      let ok = true;
      if (!firstName) { $("firstNameError").textContent = "Required"; ok = false; }
      if (!lastName)  { $("lastNameError").textContent = "Required"; ok = false; }
      if (!dob)       { $("dobError").textContent = "Required"; ok = false; }
      if (!gender)    { $("genderError").textContent = "Required"; ok = false; }
      if (!cc)        { $("countryError").textContent = "Required"; ok = false; }

      const phoneOk = /^[0-9]{6,15}$/.test(phone);
      if (!phoneOk) { $("phoneError").textContent = "Digits only (6–15)"; ok = false; }

      const emailOk = /^[^s@]+@[^s@]+.[^s@]{2,}$/.test(email);
      if (!emailOk) { $("emailError").textContent = "Invalid email"; ok = false; }

      if (!ok) {
        toast(dict().fillCorrect || "Please fill correctly.");
        speak(dict().fillCorrect || "Please fill correctly.");
        return;
      }

      APP.patient = { firstName, lastName, dob, gender, cc, phone, email, medicalId };
      localStorage.setItem("ns_pd_patient", JSON.stringify(APP.patient));

      // unlock screening
      ["voice","tremor","gait","facial"].forEach(v => setNavLocked(v, false));
      $("patientStatus")?.classList.remove("status-pending");
      $("patientStatus")?.classList.add("status-ok");
      if ($("patientStatus")) $("patientStatus").textContent = "Saved";

      toast(dict().saved || "Saved. Screening unlocked.");
      speak(dict().saved || "Saved. Screening unlocked.");
      showView("voice");
    });
  }

  function restorePatient() {
    try {
      const raw = localStorage.getItem("ns_pd_patient");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (!p || !p.firstName) return;

      APP.patient = p;
      // prefill minimal
      if ($("firstName")) $("firstName").value = p.firstName || "";
      if ($("lastName")) $("lastName").value = p.lastName || "";
      if ($("dateOfBirth")) $("dateOfBirth").value = p.dob || "";
      if ($("gender")) $("gender").value = p.gender || "";
      if ($("countryCode")) $("countryCode").value = p.cc || "";
      if ($("phoneNumber")) $("phoneNumber").value = p.phone || "";
      if ($("email")) $("email").value = p.email || "";
      if ($("medicalId")) $("medicalId").value = p.medicalId || "";

      ["voice","tremor","gait","facial"].forEach(v => setNavLocked(v, false));
      $("patientStatus")?.classList.remove("status-pending");
      $("patientStatus")?.classList.add("status-ok");
      if ($("patientStatus")) $("patientStatus").textContent = "Saved";
    } catch {}
  }

  /* ------------------------------
     3-second pre-count helper
  ------------------------------ */
  async function runPrecount(preTimerEl, seconds = 3) {
    if (!preTimerEl) return;
    let s = seconds;
    preTimerEl.textContent = String(s);
    speak(APP.lang === "hi" ? "शुरू होने वाला है।" : APP.lang === "ru" ? "Начинаем." : "Starting.");
    await sleep(450);
    while (s > 0) {
      preTimerEl.textContent = String(s);
      await sleep(650);
      s -= 1;
    }
    preTimerEl.textContent = "0";
    await sleep(120);
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async function runCountdown(mainTimerEl, seconds) {
    const end = nowMs() + seconds * 1000;
    while (nowMs() < end) {
      const left = (end - nowMs()) / 1000;
      if (mainTimerEl) mainTimerEl.textContent = fmtTimer(left);
      await sleep(120);
    }
    if (mainTimerEl) mainTimerEl.textContent = fmtTimer(0);
  }

  /* ------------------------------
     VOICE (3 trials) - real capture
  ------------------------------ */
  function initVoice() {
    const t1 = $("voiceTrial1Btn");
    const t2 = $("voiceTrial2Btn");
    const t3 = $("voiceTrial3Btn");
    const p1 = $("voiceTrial1Play");
    const p2 = $("voiceTrial2Play");
    const p3 = $("voiceTrial3Play");

    if (t1) t1.addEventListener("click", () => startVoiceTrial(0));
    if (t2) t2.addEventListener("click", () => startVoiceTrial(1));
    if (t3) t3.addEventListener("click", () => startVoiceTrial(2));

    if (p1) p1.addEventListener("click", () => playTrial(0));
    if (p2) p2.addEventListener("click", () => playTrial(1));
    if (p3) p3.addEventListener("click", () => playTrial(2));

    const save = $("saveVoiceResults");
    if (save) save.addEventListener("click", () => {
      APP.completed.voice = true;
      persistState();
      toast("Voice screening saved.");
      speak(APP.lang === "hi" ? "वॉइस सेव हो गया।" : APP.lang === "ru" ? "Речь сохранена." : "Voice saved.");
      updateProgressUI();
      maybeUnlockResults();
    });
  }

  async function startVoiceTrial(idx) {
    if (APP.voice.recording) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast("Microphone not supported in this browser.");
      return;
    }

    APP.voice.trialIndex = idx;

    const pre = $("voicePreTimer");
    const main = $("voiceMainTimer");

    await runPrecount(pre, 3);

    speak(APP.lang === "hi" ? "अब पढ़ें।" : APP.lang === "ru" ? "Читайте." : "Read now.");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); // [web:85]
      APP.voice.stream = stream;

      const mime = pickAudioMimeType();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      APP.voice.rec = rec;
      APP.voice.chunks = [];
      APP.voice.recording = true;

      markTrialStatus(idx, "Recording…");

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) APP.voice.chunks.push(e.data);
      };

      rec.onstop = async () => {
        APP.voice.recording = false;

        const blob = new Blob(APP.voice.chunks, { type: rec.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);

        // cleanup old url
        if (APP.voiceTrials[idx].url) URL.revokeObjectURL(APP.voiceTrials[idx].url);

        APP.voiceTrials[idx] = { blob, url, ok: true };
        enablePlay(idx, true);
        markTrialStatus(idx, "Recorded ✅");

        stopStream(APP.voice.stream);
        APP.voice.stream = null;

        // compute real features from the audio (WebAudio)
        try {
          await computeVoiceFeaturesFromBlob();
        } catch {
          // if decoding fails, keep only “recorded” state (no fake numbers)
          toast("Audio captured. Feature extraction not available on this device.");
        }

        // enable save if all 3 present
        if (APP.voiceTrials.every(t => t.ok)) {
          $("saveVoiceResults").disabled = false;
          // store voice score proxy based on real feature extraction availability:
          // if features exist => compute severity; else leave score null until computed.
          if (APP.metrics.voice) {
            APP.scores.voice = scoreVoice(APP.metrics.voice);
          }
        }
      };

      rec.start();
      await runCountdown(main, APP.voice.durationSec);
      rec.stop();
    } catch (e) {
      APP.voice.recording = false;
      toast("Microphone permission denied or unavailable.");
    }
  }

  function pickAudioMimeType() {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg"
    ];
    if (!("MediaRecorder" in window)) return null;
    return candidates.find(t => MediaRecorder.isTypeSupported(t)) || null;
  }

  function playTrial(idx) {
    const t = APP.voiceTrials[idx];
    if (!t || !t.url) return;
    const a = new Audio(t.url);
    a.play().catch(() => toast("Playback blocked by browser."));
  }

  function enablePlay(idx, on) {
    const map = [$("voiceTrial1Play"), $("voiceTrial2Play"), $("voiceTrial3Play")];
    if (map[idx]) map[idx].disabled = !on;
  }

  function markTrialStatus(idx, text) {
    const map = [$("voiceTrial1Status"), $("voiceTrial2Status"), $("voiceTrial3Status")];
    if (map[idx]) map[idx].textContent = text;
  }

  async function computeVoiceFeaturesFromBlob() {
    // Use all three recordings; decode to PCM; compute:
    // - pitch (autocorrelation), HNR-like harmonicity proxy, jitter/shimmer proxies from period/amplitude variability.
    // This is NOT clinical-grade; but it is real computation (no random). [web:85]
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = [];
    for (const t of APP.voiceTrials) {
      const arr = await t.blob.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr.slice(0));
      decoded.push(buf);
    }

    const features = decoded.map(extractVoiceFeaturesFromAudioBuffer);
    // Aggregate (median/mean) across trials
    const avg = (k) => {
      const v = features.map(x => x[k]).filter(n => Number.isFinite(n));
      if (!v.length) return null;
      return v.reduce((a,b)=>a+b,0) / v.length;
    };
    const med = (k) => {
      const v = features.map(x => x[k]).filter(n => Number.isFinite(n)).sort((a,b)=>a-b);
      if (!v.length) return null;
      const m = Math.floor(v.length/2);
      return v.length%2 ? v[m] : (v[m-1]+v[m])/2;
    };

    const out = {
      jitterPct: avg("jitterPct"),
      shimmerDb: avg("shimmerDb"),
      hnrDb: avg("hnrDb"),
      pitchHz: med("pitchHz")
    };

    // Update UI only with computed values (no placeholders pretending to be real)
    setMetric("jitterValue", out.jitterPct, (v)=> v==null ? "--" : v.toFixed(2));
    setMetric("shimmerValue", out.shimmerDb, (v)=> v==null ? "--" : v.toFixed(2));
    setMetric("hnrValue", out.hnrDb, (v)=> v==null ? "--" : v.toFixed(1));
    setMetric("pitchValue", out.pitchHz, (v)=> v==null ? "--" : Math.round(v).toString());

    APP.metrics.voice = out;
    APP.scores.voice = scoreVoice(out);

    persistState();
  }

  function extractVoiceFeaturesFromAudioBuffer(buffer) {
    // Use mono channel; downsample analysis
    const sr = buffer.sampleRate;
    const ch = buffer.getChannelData(0);
    const start = Math.floor(ch.length * 0.15);
    const end = Math.floor(ch.length * 0.85);
    const x = ch.slice(start, end);

    // basic energy gate
    const rms = Math.sqrt(x.reduce((s,v)=>s+v*v,0) / x.length);
    if (!Number.isFinite(rms) || rms < 0.005) {
      return { pitchHz: null, jitterPct: null, shimmerDb: null, hnrDb: null };
    }

    // Autocorrelation pitch estimate in 70..300 Hz
    const pitchHz = estimatePitchACF(x, sr, 70, 300);

    // If pitch not detected, return nulls
    if (!pitchHz) {
      return { pitchHz: null, jitterPct: null, shimmerDb: null, hnrDb: null };
    }

    // derive period in samples
    const period = sr / pitchHz;

    // Compute cycles: peaks at multiples of period; estimate per-cycle amplitude & period jitter
    const cycles = measureCycles(x, sr, pitchHz);
    if (cycles.length < 8) {
      return { pitchHz, jitterPct: null, shimmerDb: null, hnrDb: null };
    }

    // jitter: mean absolute diff of consecutive periods / mean period
    const periods = cycles.map(c => c.periodSamp);
    const amps = cycles.map(c => c.amp);

    const meanP = mean(periods);
    const jitter = meanAbsDiff(periods) / meanP;
    const jitterPct = jitter * 100;

    // shimmer: amplitude variation (dB) from consecutive cycles
    const meanA = mean(amps);
    const shimmerLin = meanAbsDiff(amps) / meanA;
    const shimmerDb = 20 * Math.log10(1 + shimmerLin);

    // HNR proxy: harmonic energy vs residual energy in a band
    const hnrDb = harmonicToNoiseProxyDb(x, sr, pitchHz);

    return { pitchHz, jitterPct, shimmerDb, hnrDb };
  }

  function estimatePitchACF(x, sr, fMin, fMax) {
    // autocorrelation on windowed signal
    const N = x.length;
    const w = hann(N);
    const y = new Float32Array(N);
    for (let i=0;i<N;i++) y[i] = x[i]*w[i];

    const lagMin = Math.floor(sr / fMax);
    const lagMax = Math.floor(sr / fMin);

    let bestLag = 0, best = -Infinity;
    for (let lag = lagMin; lag <= lagMax; lag++) {
      let sum = 0;
      for (let i=0;i<N-lag;i++) sum += y[i]*y[i+lag];
      if (sum > best) { best = sum; bestLag = lag; }
    }
    if (!bestLag) return null;
    const pitch = sr / bestLag;
    if (!Number.isFinite(pitch)) return null;
    return pitch;
  }

  function hann(N){
    const w = new Float32Array(N);
    for (let i=0;i<N;i++) w[i] = 0.5*(1 - Math.cos((2*Math.PI*i)/(N-1)));
    return w;
  }

  function measureCycles(x, sr, pitchHz) {
    const period = sr / pitchHz;
    const cycles = [];
    // step through signal by period, find local max amplitude in each cycle window
    let i = 0;
    while (i + period < x.length) {
      const a = Math.floor(i);
      const b = Math.floor(i + period);
      let maxAbs = 0;
      for (let k=a;k<b;k++) {
        const v = Math.abs(x[k]);
        if (v > maxAbs) maxAbs = v;
      }
      cycles.push({ periodSamp: period, amp: maxAbs });
      i += period;
    }
    return cycles;
  }

  function harmonicToNoiseProxyDb(x, sr, pitchHz) {
    // Simple proxy: bandpass energy around pitch harmonics vs total energy (rough).
    // Compute FFT-less proxy by correlating with sine at pitch and second harmonic.
    const w = hann(x.length);
    let s1=0,c1=0,s2=0,c2=0,tot=0;
    for (let i=0;i<x.length;i++){
      const t = i / sr;
      const v = x[i]*w[i];
      const a1 = 2*Math.PI*pitchHz*t;
      const a2 = 2*Math.PI*(2*pitchHz)*t;
      s1 += v*Math.sin(a1); c1 += v*Math.cos(a1);
      s2 += v*Math.sin(a2); c2 += v*Math.cos(a2);
      tot += v*v;
    }
    const harm = (s1*s1+c1*c1) + 0.5*(s2*s2+c2*c2);
    const noise = Math.max(1e-12, tot - harm);
    const hnr = 10*Math.log10(Math.max(1e-12, harm) / noise);
    return clamp(hnr, -10, 40);
  }

  function mean(arr){ return arr.reduce((a,b)=>a+b,0)/arr.length; }
  function meanAbsDiff(arr){
    if (arr.length < 2) return 0;
    let s=0; for (let i=1;i<arr.length;i++) s += Math.abs(arr[i]-arr[i-1]);
    return s/(arr.length-1);
  }

  function setMetric(id, val, fmt) {
    const el = $(id);
    if (!el) return;
    el.textContent = fmt ? fmt(val) : String(val);
  }

  function scoreVoice(v) {
    // Severity proxy from real voice features (NOT UPDRS score):
    // Higher jitter/shimmer and lower HNR -> worse.
    // Map to 0..4 with simple thresholds (transparent, non-random).
    if (!v) return null;
    const jitter = v.jitterPct;
    const shimmer = v.shimmerDb;
    const hnr = v.hnrDb;

    // require at least two features
    const okCount = [jitter, shimmer, hnr].filter(n => Number.isFinite(n)).length;
    if (okCount < 2) return null;

    let s = 0;
    if (Number.isFinite(jitter)) {
      s += jitter < 0.8 ? 0 : jitter < 1.2 ? 1 : jitter < 1.8 ? 2 : jitter < 2.6 ? 3 : 4;
    }
    if (Number.isFinite(shimmer)) {
      s += shimmer < 0.25 ? 0 : shimmer < 0.45 ? 1 : shimmer < 0.70 ? 2 : shimmer < 1.0 ? 3 : 4;
    }
    if (Number.isFinite(hnr)) {
      s += hnr > 20 ? 0 : hnr > 15 ? 1 : hnr > 10 ? 2 : hnr > 6 ? 3 : 4;
    }
    const avg = s / okCount;
    return clamp(Math.round(avg), 0, 4);
  }

  /* ------------------------------
     TREMOR (DeviceMotion) - real capture
  ------------------------------ */
  function initTremor() {
    const right = $("rightHandBtn");
    const left = $("leftHandBtn");
    if (right) right.addEventListener("click", () => selectHand("right"));
    if (left) left.addEventListener("click", () => selectHand("left"));

    const start = $("startTremorTest");
    if (start) start.addEventListener("click", () => startTremor());

    const save = $("saveTremorResults");
    if (save) save.addEventListener("click", () => {
      APP.completed.tremor = true;
      persistState();
      toast("Tremor screening saved.");
      speak(APP.lang === "hi" ? "कंपन सेव हो गया।" : APP.lang === "ru" ? "Тремор сохранён." : "Tremor saved.");
      updateProgressUI();
      maybeUnlockResults();
    });
  }

  function selectHand(hand) {
    APP.tremor.hand = hand;
    $("rightHandBtn")?.classList.toggle("active", hand === "right");
    $("leftHandBtn")?.classList.toggle("active", hand === "left");
  }

  async function requestMotionPermissionIfNeeded() {
    // iOS 13+ requires a user gesture to request permission. [web:148]
    try {
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        const r = await DeviceMotionEvent.requestPermission();
        if (r !== "granted") throw new Error("denied");
      }
    } catch {
      // Do not toast aggressively; user might not be on iOS.
    }
  }

  async function startTremor() {
    if (APP.tremor.running) return;

    if (typeof DeviceMotionEvent === "undefined") {
      toast("Device motion not supported on this device.");
      return;
    }

    await requestMotionPermissionIfNeeded();

    const pre = $("tremorPreTimer");
    const main = $("tremorMainTimer");
    await runPrecount(pre, 3);

    APP.tremor.running = true;
    APP.tremor.samples = [];
    speak(APP.lang === "hi" ? "स्थिर रहें।" : APP.lang === "ru" ? "Не двигайтесь." : "Keep still.");

    const t0 = nowMs();
    const handler = (e) => {
      const a = e.accelerationIncludingGravity || e.acceleration; // [web:148]
      if (!a) return;
      const ax = a.x ?? 0, ay = a.y ?? 0, az = a.z ?? 0;
      const mag = Math.sqrt(ax*ax + ay*ay + az*az);
      APP.tremor.samples.push({ t: nowMs() - t0, mag });
    };
    APP.tremor.listener = handler;
    window.addEventListener("devicemotion", handler, { passive: true });

    await runCountdown(main, APP.tremor.durationSec);

    window.removeEventListener("devicemotion", handler);
    APP.tremor.listener = null;
    APP.tremor.running = false;

    // compute real tremor metrics (frequency peak + RMS amplitude proxy)
    const out = computeTremorMetrics(APP.tremor.samples);
    if (!out) {
      toast("Not enough motion samples captured.");
      return;
    }

    APP.metrics.tremor = out;
    APP.scores.tremor = scoreTremor(out);

    setMetric("frequencyValue", out.freqHz, v => v == null ? "--" : v.toFixed(2));
    setMetric("amplitudeValue", out.ampMm, v => v == null ? "--" : v.toFixed(1));
    setMetric("consistencyValue", out.consistencyPct, v => v == null ? "--" : Math.round(v).toString());
    setMetric("severityScore", APP.scores.tremor, v => v == null ? "--" : String(v));

    $("saveTremorResults").disabled = false;
    persistState();
  }

  function computeTremorMetrics(samples) {
    // Need enough samples
    if (!samples || samples.length < 60) return null;

    // resample to uniform dt for FFT-ish peak detection using autocorrelation of detrended mag
    const tEnd = samples[samples.length - 1].t;
    if (tEnd < 8000) return null;

    // Build uniform series at 50Hz
    const fs = 50;
    const dt = 1000 / fs;
    const n = Math.floor(tEnd / dt);
    const y = new Float32Array(n);
    let j = 0;
    for (let i=0;i<n;i++){
      const t = i*dt;
      while (j+1 < samples.length && samples[j+1].t < t) j++;
      const s0 = samples[j], s1 = samples[Math.min(j+1, samples.length-1)];
      const t0 = s0.t, t1 = s1.t || (t0 + 1);
      const a = (t - t0) / Math.max(1e-6, (t1 - t0));
      y[i] = (1-a)*s0.mag + a*s1.mag;
    }

    // detrend (remove mean)
    const meanY = y.reduce((a,b)=>a+b,0)/y.length;
    for (let i=0;i<y.length;i++) y[i] -= meanY;

    // RMS amplitude (m/s^2). Convert to mm proxy with a scale for UI only.
    const rms = Math.sqrt(y.reduce((s,v)=>s+v*v,0)/y.length);

    // Find dominant frequency in 3..12 Hz range using autocorrelation peak
    const fMin = 3, fMax = 12;
    const lagMin = Math.floor(fs / fMax);
    const lagMax = Math.floor(fs / fMin);
    let bestLag = 0, best = -Infinity;
    for (let lag=lagMin; lag<=lagMax; lag++){
      let sum = 0;
      for (let i=0;i<y.length-lag;i++) sum += y[i]*y[i+lag];
      if (sum > best) { best = sum; bestLag = lag; }
    }
    const freqHz = bestLag ? (fs / bestLag) : null;

    // consistency: how stable amplitude is across windows
    const win = Math.floor(fs * 2); // 2s windows
    const amps = [];
    for (let i=0;i+win<=y.length;i+=win){
      const seg = y.slice(i, i+win);
      const r = Math.sqrt(seg.reduce((s,v)=>s+v*v,0)/seg.length);
      amps.push(r);
    }
    if (!amps.length) return null;
    const m = mean(amps);
    const sd = Math.sqrt(mean(amps.map(a => (a-m)*(a-m))));
    const cv = sd / Math.max(1e-9, m);
    const consistencyPct = clamp(100 * (1 - cv), 0, 100);

    // Convert rms to "mm" proxy (NOT calibrated). Still real signal, just scaled.
    const ampMm = rms * 4.0;

    return { freqHz, ampMm, consistencyPct, rmsAcc: rms };
  }

  function scoreTremor(t) {
    if (!t) return null;
    // transparent mapping from physical signal proxies:
    // freq and amplitude both contribute.
    const f = t.freqHz;
    const a = t.ampMm;
    if (!Number.isFinite(f) || !Number.isFinite(a)) return null;

    // amplitude-based bins
    const sa = a < 0.6 ? 0 : a < 1.2 ? 1 : a < 2.0 ? 2 : a < 3.5 ? 3 : 4;

    // frequency: typical PD rest tremor 4–6Hz; but severity is not frequency—use it lightly
    const sf = (f >= 3 && f <= 12) ? (Math.abs(f-5) < 1.2 ? 1 : 0) : 0;

    const avg = clamp(Math.round((sa*0.9 + sf*0.1)), 0, 4);
    return avg;
  }

  /* ------------------------------
     CAMERA helpers + flip fixes
  ------------------------------ */
  async function startCameraStream(videoEl, facingMode) {
    // Always request a fresh stream when flipping; stop old tracks first. [web:85]
    const constraints = {
      video: {
        facingMode: { ideal: facingMode }, // user/environment
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints); // [web:85]
    videoEl.srcObject = stream;
    await videoEl.play();
    return stream;
  }

  function stopStream(stream) {
    if (!stream) return;
    stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
  }

  /* ------------------------------
     GAIT (MediaPipe Pose)
  ------------------------------ */
  function initGait() {
    $("startGaitTest")?.addEventListener("click", () => startGait());
    $("flipGaitCamera")?.addEventListener("click", () => flipGait());
    $("gaitFullscreen")?.addEventListener("click", () => toggleFullscreen($("gaitViz")));
    $("saveGaitResults")?.addEventListener("click", () => {
      APP.completed.gait = true;
      persistState();
      toast("Gait screening saved.");
      speak(APP.lang === "hi" ? "गैट सेव हो गया।" : APP.lang === "ru" ? "Походка сохранена." : "Gait saved.");
      updateProgressUI();
      maybeUnlockResults();
    });
  }

  async function ensurePosePipeline() {
    const video = $("gaitVideo");
    const canvas = $("gaitCanvas");
    if (!video || !canvas) return null;

    const ctx = canvas.getContext("2d");

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      selfieMode: (APP.cams.gait.facing === "user")
    });
    pose.onResults((res) => {
      canvas.width = video.videoWidth || canvas.width;
      canvas.height = video.videoHeight || canvas.height;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // Draw skeleton + landmarks (real). [web:47]
      if (res.poseLandmarks) {
        drawConnectors(ctx, res.poseLandmarks, POSE_CONNECTIONS, { color: "rgba(46,230,255,0.95)", lineWidth: 3 });
        drawLandmarks(ctx, res.poseLandmarks, { color: "rgba(157,255,79,0.95)", lineWidth: 2, radius: 3 });
        ingestGaitLandmarks(res.poseLandmarks);
      }
    });

    return pose;
  }

  let gaitSeries = []; // {t, leftAnkleY, rightAnkleY}

  function ingestGaitLandmarks(lm) {
    // Landmarks normalized; track ankle y oscillation over time to estimate cadence proxy
    const la = lm[27]; // left ankle
    const ra = lm[28]; // right ankle
    if (!la || !ra) return;
    gaitSeries.push({ t: nowMs(), lay: la.y, ray: ra.y });
    // keep last ~20s
    const cut = nowMs() - 25000;
    gaitSeries = gaitSeries.filter(p => p.t >= cut);
  }

  async function startGait() {
    if (APP.cams.gait.running) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast("Camera not supported.");
      return;
    }

    const pre = $("gaitPreTimer");
    const main = $("gaitMainTimer");
    await runPrecount(pre, 3);

    const video = $("gaitVideo");
    if (!video) return;

    // start stream fresh
    stopStream(APP.cams.gait.stream);
    APP.cams.gait.stream = await startCameraStream(video, APP.cams.gait.facing);

    // pipeline
    APP.cams.gait.mp = await ensurePosePipeline();
    if (!APP.cams.gait.mp) return;

    // Use MediaPipe Camera helper
    APP.cams.gait.camera = new Camera(video, {
      onFrame: async () => { await APP.cams.gait.mp.send({ image: video }); },
      width: 1280,
      height: 720
    });

    gaitSeries = [];
    APP.cams.gait.running = true;
    speak(APP.lang === "hi" ? "चलना शुरू करें।" : APP.lang === "ru" ? "Начинайте идти." : "Start walking.");

    await APP.cams.gait.camera.start();
    await runCountdown(main, APP.cams.gait.durationSec);

    // stop
    APP.cams.gait.running = false;
    try { APP.cams.gait.camera.stop(); } catch {}
    stopStream(APP.cams.gait.stream);
    APP.cams.gait.stream = null;

    // compute real gait metrics from captured series
    const out = computeGaitMetrics(gaitSeries);
    if (!out) {
      toast("Not enough gait data captured.");
      return;
    }
    APP.metrics.gait = out;
    APP.scores.gait = scoreGait(out);

    setMetric("stepCadence", out.cadenceSpm, v => v==null ? "--" : Math.round(v).toString());
    setMetric("stepLength", out.stepLenCm, v => v==null ? "--" : Math.round(v).toString());
    setMetric("balanceScore", out.balanceScore, v => v==null ? "--" : v.toFixed(0));
    setMetric("postureScore", out.postureScore, v => v==null ? "--" : v.toFixed(0));

    $("saveGaitResults").disabled = false;
    persistState();
  }

  async function flipGait() {
    APP.cams.gait.facing = (APP.cams.gait.facing === "user") ? "environment" : "user";
    // If currently running, restart stream and update selfieMode.
    if ($("gaitVideo") && APP.cams.gait.running) {
      toast("Flipping camera…");
      try {
        stopStream(APP.cams.gait.stream);
        APP.cams.gait.stream = await startCameraStream($("gaitVideo"), APP.cams.gait.facing);
        if (APP.cams.gait.mp) APP.cams.gait.mp.setOptions({ selfieMode: (APP.cams.gait.facing === "user") });
      } catch {
        toast("Unable to flip camera on this device.");
      }
    } else {
      toast("Camera set. Start the test to apply.");
    }
  }

  function computeGaitMetrics(series) {
    if (!series || series.length < 30) return null;

    // Convert to seconds relative
    const t0 = series[0].t;
    const y = series.map(p => ({ t: (p.t - t0)/1000, v: (p.lay + p.ray)/2 }));
    const duration = y[y.length-1].t;
    if (duration < 6) return null;

    // Detrend
    const meanV = y.reduce((s,p)=>s+p.v,0)/y.length;
    const v = y.map(p => ({ t: p.t, v: p.v - meanV }));

    // Find zero-crossings of derivative to estimate steps (peaks)
    const peaks = [];
    for (let i=1;i<v.length-1;i++){
      const a = v[i-1].v, b = v[i].v, c = v[i+1].v;
      if (b > a && b > c && b > 0.002) peaks.push(v[i].t);
    }
    // cadence: peaks per minute (each peak approx half-step depending; treat as step events proxy)
    const steps = peaks.length;
    const cadenceSpm = steps > 1 ? (steps / duration) * 60 : null;

    // step length: cannot be accurately estimated without calibration; leave null (no fake)
    const stepLenCm = null;

    // balance/posture: placeholders are not allowed; compute simple stability proxies
    // balance: lower variability in ankle y => better
    const sd = Math.sqrt(mean(v.map(p => p.v*p.v)));
    const balanceScore = clamp(100 - (sd * 6000), 0, 100);

    // posture: without shoulders/hip angles calibration, compute a proxy from hip-shoulder vertical alignment variability
    const postureScore = clamp(75, 0, 100); // if you want this fully real, we can compute from landmarks each frame; kept conservative constant? -> user said no fake.
    // To honor "no fake", set postureScore to null until computed per-frame.
    return { cadenceSpm, stepLenCm, balanceScore, postureScore: null };
  }

  function scoreGait(g) {
    // Domain proxy from cadence only if available; else null (no guessing)
    if (!g || !Number.isFinite(g.cadenceSpm)) return null;
    const c = g.cadenceSpm;
    // Very rough: unusually low cadence could indicate bradykinesia
    const s = c > 95 ? 0 : c > 85 ? 1 : c > 75 ? 2 : c > 65 ? 3 : 4;
    return s;
  }

  /* ------------------------------
     FACIAL (MediaPipe FaceMesh)
  ------------------------------ */
  function initFace() {
    $("startFaceTest")?.addEventListener("click", () => startFace());
    $("flipFaceCamera")?.addEventListener("click", () => flipFace());
    $("faceFullscreen")?.addEventListener("click", () => toggleFullscreen($("faceViz")));
    $("saveFaceResults")?.addEventListener("click", () => {
      APP.completed.facial = true;
      persistState();
      toast("Facial screening saved.");
      speak(APP.lang === "hi" ? "चेहरा सेव हो गया।" : APP.lang === "ru" ? "Мимика сохранена." : "Facial saved.");
      updateProgressUI();
      maybeUnlockResults();
    });
  }

  async function ensureFacePipeline() {
    const video = $("faceVideo");
    const canvas = $("faceCanvas");
    if (!video || !canvas) return null;

    const ctx = canvas.getContext("2d");

    const fm = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    fm.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: (APP.cams.face.facing === "user")
    });

    fm.onResults((res) => {
      canvas.width = video.videoWidth || canvas.width;
      canvas.height = video.videoHeight || canvas.height;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      if (res.multiFaceLandmarks && res.multiFaceLandmarks[0]) {
        const lm = res.multiFaceLandmarks[0];

        // draw mesh (real). [web:60]
        drawConnectors(ctx, lm, FACEMESH_TESSELATION, { color: "rgba(255,79,216,0.50)", lineWidth: 1 });
        drawConnectors(ctx, lm, FACEMESH_RIGHT_EYE, { color: "rgba(46,230,255,0.95)", lineWidth: 2 });
        drawConnectors(ctx, lm, FACEMESH_LEFT_EYE, { color: "rgba(46,230,255,0.95)", lineWidth: 2 });
        drawConnectors(ctx, lm, FACEMESH_FACE_OVAL, { color: "rgba(157,255,79,0.95)", lineWidth: 2 });

        ingestFaceLandmarks(lm);
      }
    });

    return fm;
  }

  let faceSeries = []; // {t, earL, earR, symmetry}

  function dist(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }

  function eyeAspectRatio(lm, eye) {
    // Using a few landmarks for EAR approximation (normalized coords)
    // Left eye indexes: 33, 160, 158, 133, 153, 144 (classic mapping in many examples)
    // Right eye indexes: 362, 385, 387, 263, 373, 380
    let idx;
    if (eye === "L") idx = [33,160,158,133,153,144];
    else idx = [362,385,387,263,373,380];

    const [p1,p2,p3,p4,p5,p6] = idx.map(i => lm[i]);
    if (!p1||!p2||!p3||!p4||!p5||!p6) return null;

    const A = dist(p2,p6);
    const B = dist(p3,p5);
    const C = dist(p1,p4);
    if (!C) return null;
    return (A + B) / (2 * C);
  }

  function ingestFaceLandmarks(lm) {
    const earL = eyeAspectRatio(lm, "L");
    const earR = eyeAspectRatio(lm, "R");
    if (!Number.isFinite(earL) || !Number.isFinite(earR)) return;

    const symmetry = 1 - (Math.abs(earL - earR) / Math.max(1e-6, (earL + earR)/2));
    faceSeries.push({ t: nowMs(), earL, earR, symmetry });

    const cut = nowMs() - 20000;
    faceSeries = faceSeries.filter(p => p.t >= cut);
  }

  async function startFace() {
    if (APP.cams.face.running) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast("Camera not supported.");
      return;
    }

    const pre = $("facePreTimer");
    const main = $("faceMainTimer");
    await runPrecount(pre, 3);

    const video = $("faceVideo");
    if (!video) return;

    stopStream(APP.cams.face.stream);
    APP.cams.face.stream = await startCameraStream(video, APP.cams.face.facing);

    APP.cams.face.mp = await ensureFacePipeline();
    if (!APP.cams.face.mp) return;

    APP.cams.face.camera = new Camera(video, {
      onFrame: async () => { await APP.cams.face.mp.send({ image: video }); },
      width: 1280,
      height: 720
    });

    faceSeries = [];
    APP.cams.face.running = true;
    speak(APP.lang === "hi" ? "चेहरा सामान्य रखें।" : APP.lang === "ru" ? "Сохраняйте нейтральное лицо." : "Hold a neutral face.");

    await APP.cams.face.camera.start();
    await runCountdown(main, APP.cams.face.durationSec);

    APP.cams.face.running = false;
    try { APP.cams.face.camera.stop(); } catch {}
    stopStream(APP.cams.face.stream);
    APP.cams.face.stream = null;

    const out = computeFaceMetrics(faceSeries);
    if (!out) {
      toast("Not enough facial data captured.");
      return;
    }

    APP.metrics.facial = out;
    APP.scores.facial = scoreFace(out);

    setMetric("symmetryScore", out.symmetryScore, v => v==null ? "--" : Math.round(v).toString());
    setMetric("blinkRate", out.blinkRatePerMin, v => v==null ? "--" : Math.round(v).toString());
    setMetric("expressionScore", out.expressionScore, v => v==null ? "--" : Math.round(v).toString());
    setMetric("movementScore", out.movementScore, v => v==null ? "--" : Math.round(v).toString());

    $("saveFaceResults").disabled = false;
    persistState();
  }

  async function flipFace() {
    APP.cams.face.facing = (APP.cams.face.facing === "user") ? "environment" : "user";
    if ($("faceVideo") && APP.cams.face.running) {
      toast("Flipping camera…");
      try {
        stopStream(APP.cams.face.stream);
        APP.cams.face.stream = await startCameraStream($("faceVideo"), APP.cams.face.facing);
        if (APP.cams.face.mp) APP.cams.face.mp.setOptions({ selfieMode: (APP.cams.face.facing === "user") });
      } catch {
        toast("Unable to flip camera on this device.");
      }
    } else {
      toast("Camera set. Start the test to apply.");
    }
  }

  function computeFaceMetrics(series) {
    if (!series || series.length < 25) return null;

    // symmetry score 0..100
    const sym = series.map(p => p.symmetry).filter(Number.isFinite);
    if (!sym.length) return null;
    const symAvg = sym.reduce((a,b)=>a+b,0)/sym.length;
    const symmetryScore = clamp(symAvg * 100, 0, 100);

    // blink detection: EAR drops below threshold then rises
    const ear = series.map(p => (p.earL + p.earR)/2).filter(Number.isFinite);
    if (ear.length < 10) return { symmetryScore, blinkRatePerMin: null, expressionScore: null, movementScore: null };

    const thr = percentile(ear, 15); // adaptive
    let blinks = 0;
    let closed = false;
    for (let i=0;i<ear.length;i++){
      if (!closed && ear[i] < thr*0.92) { closed = true; }
      if (closed && ear[i] > thr*1.05) { closed = false; blinks++; }
    }

    const t0 = series[0].t, t1 = series[series.length-1].t;
    const durMin = Math.max(1e-6, (t1 - t0) / 60000);
    const blinkRatePerMin = blinks / durMin;

    // movement score: variability of EAR -> proxy for facial movement (lower movement could indicate hypomimia)
    const sd = Math.sqrt(mean(ear.map(v => (v - mean(ear))*(v - mean(ear)))));
    const movementScore = clamp(100 - sd*800, 0, 100);

    // expression score: use movementScore + blinkRate (still proxy, but computed)
    let expressionScore = null;
    if (Number.isFinite(blinkRatePerMin)) {
      // typical blink rate varies; keep as a soft indicator
      const blinkPenalty = blinkRatePerMin < 6 ? 15 : blinkRatePerMin > 35 ? 10 : 0;
      expressionScore = clamp(movementScore - blinkPenalty, 0, 100);
    } else {
      expressionScore = movementScore;
    }

    return { symmetryScore, blinkRatePerMin, expressionScore, movementScore };
  }

  function percentile(arr, p) {
    const a = arr.slice().sort((x,y)=>x-y);
    const idx = clamp(Math.floor((p/100) * (a.length-1)), 0, a.length-1);
    return a[idx];
  }

  function scoreFace(f) {
    if (!f || !Number.isFinite(f.expressionScore)) return null;
    // lower expressionScore -> worse
    const e = f.expressionScore;
    const s = e > 85 ? 0 : e > 75 ? 1 : e > 65 ? 2 : e > 55 ? 3 : 4;
    return s;
  }

  /* ------------------------------
     Results + Radar chart
  ------------------------------ */
  function updateProgressUI() {
    const done = Object.values(APP.completed).filter(Boolean).length;
    if ($("screeningStatus")) $("screeningStatus").textContent = `${done}/4`;

    // unlock results when all are completed (saved)
    if (done >= 1) {
      // allow results once at least one is done
      setNavLocked("results", false);
    }
    if (done === 4) {
      setNavLocked("report", false);
      if ($("reportStatus")) {
        $("reportStatus").classList.remove("status-pending");
        $("reportStatus").classList.add("status-ok");
        $("reportStatus").textContent = "Ready";
      }
      if ($("goToReportBtn")) $("goToReportBtn").disabled = false;
    }
  }

  function maybeUnlockResults() {
    updateProgressUI();
    if (Object.values(APP.completed).filter(Boolean).length >= 1) {
      setNavLocked("results", false);
    }
  }

  function resultStatus(domain) {
    return APP.completed[domain] ? "Complete" : "Pending";
  }

  function renderResults() {
    const body = $("resultsTableBody");
    if (!body) return;
    body.innerHTML = "";

    const rows = [
      { k: "voice", label: "Speech" },
      { k: "tremor", label: "Tremor" },
      { k: "gait", label: "Gait" },
      { k: "facial", label: "Facial" }
    ];

    for (const r of rows) {
      const tr = document.createElement("tr");
      const status = resultStatus(r.k);
      const score = APP.scores[r.k];
      const comment = makeComment(r.k);

      tr.innerHTML = `
        <td>${r.label}</td>
        <td>${status}</td>
        <td>${(score === null || score === undefined) ? "--" : score}</td>
        <td>${comment}</td>
      `;
      body.appendChild(tr);
    }

    const allDone = Object.values(APP.completed).every(Boolean);
    const risk = $("overallRisk");
    const imp = $("clinicalImpression");

    if (risk && imp) {
      if (!allDone) {
        risk.className = "risk-indicator risk-low";
        risk.innerHTML = `<i class="fas fa-info-circle"></i><span>Incomplete ‑ more tests needed</span>`;
        imp.innerHTML = `<p>Domain scores shown are computed from captured signals (prototype), not clinical diagnosis.</p>`;
      } else {
        const avg = averageSeverity();
        const cls = avg <= 1 ? "risk-low" : avg <= 2 ? "risk-medium" : "risk-high";
        risk.className = `risk-indicator ${cls}`;
        risk.innerHTML = `<i class="fas fa-chart-line"></i><span>Aggregate severity proxy: ${avg.toFixed(1)} / 4</span>`;
        imp.innerHTML = `<p>This is an engineering summary of measured signals. It is not an MDS‑UPDRS clinical score and must not be used for diagnosis.</p>`;
      }
    }

    renderRadar();
  }

  function averageSeverity() {
    const v = Object.values(APP.scores).filter(n => Number.isFinite(n));
    if (!v.length) return 0;
    return v.reduce((a,b)=>a+b,0)/v.length;
  }

  function makeComment(k) {
    if (!APP.completed[k]) return "Complete the test to see computed metrics.";
    if (APP.scores[k] == null) return "Captured, but scoring unavailable (insufficient data).";
    if (APP.scores[k] <= 1) return "Within typical range for this capture.";
    if (APP.scores[k] === 2) return "Mild deviation in captured signal.";
    return "Moderate-to-high deviation in captured signal.";
  }

  function radarData() {
    const labels = ["Speech","Tremor","Gait","Facial"];
    const data = [
      APP.scores.voice ?? 0,
      APP.scores.tremor ?? 0,
      APP.scores.gait ?? 0,
      APP.scores.facial ?? 0
    ];
    return { labels, data };
  }

  function renderRadar() {
    const canvas = $("radarChartCanvas");
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext("2d");
    const { labels, data } = radarData();

    if (APP.radar.chart) {
      APP.radar.chart.data.labels = labels;
      APP.radar.chart.data.datasets[0].data = data;
      APP.radar.chart.update();
      return;
    }

    APP.radar.chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [{
          label: "Severity (0–4)",
          data,
          fill: true,
          backgroundColor: "rgba(46,230,255,0.16)",
          borderColor: "rgba(46,230,255,0.95)",
          pointBackgroundColor: "rgba(157,255,79,0.95)",
          pointBorderColor: "rgba(255,255,255,0.9)",
          pointHoverBackgroundColor: "rgba(255,79,216,0.95)",
          pointHoverBorderColor: "rgba(255,255,255,1)",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0,
            max: 4,
            ticks: { stepSize: 1, showLabelBackdrop: false, color: "rgba(243,247,255,0.65)" },
            grid: { color: "rgba(255,255,255,0.12)" },
            angleLines: { color: "rgba(255,255,255,0.12)" },
            pointLabels: { color: "rgba(243,247,255,0.85)", font: { weight: "800" } }
          }
        },
        plugins: {
          legend: { labels: { color: "rgba(243,247,255,0.85)", font: { weight: "800" } } }
        }
      }
    });

    // Download buttons
    $("downloadRadarPng")?.addEventListener("click", downloadRadarPNG);
    $("downloadRadarPdf")?.addEventListener("click", downloadRadarPDF);
    $("generateReport")?.addEventListener("click", downloadFullReportPDF);
  }

  function downloadRadarPNG() {
    if (!APP.radar.chart) return;
    // Chart.js provides base64 export. [web:82]
    const url = APP.radar.chart.toBase64Image("image/png", 1);
    downloadDataUrl(url, "NeuroSynapsePD_Radar.png");
  }

  async function downloadRadarPDF() {
    if (!APP.radar.chart) return;
    const img = APP.radar.chart.toBase64Image("image/png", 1);
    await ensureJsPDF();
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { toast("PDF library failed to load."); return; }

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("NeuroSynapse‑PD Radar Summary", 40, 48);

    // Fit image
    const pageW = pdf.internal.pageSize.getWidth();
    const maxW = pageW - 80;
    const x = 40, y = 70;
    pdf.addImage(img, "PNG", x, y, maxW, maxW * 0.75);
    pdf.save("NeuroSynapsePD_Radar.pdf");
  }

  function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function ensureJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return;
    await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function renderReport() {
    const p = $("reportPatientInfo");
    const s = $("reportSummary");
    if (p) {
      if (!APP.patient) {
        p.innerHTML = `<p>No patient information available.</p>`;
      } else {
        p.innerHTML = `
          <p><strong>Name:</strong> ${escapeHtml(APP.patient.firstName)} ${escapeHtml(APP.patient.lastName)}</p>
          <p><strong>DOB:</strong> ${escapeHtml(APP.patient.dob)}</p>
          <p><strong>Contact:</strong> ${escapeHtml(APP.patient.cc)} ${escapeHtml(APP.patient.phone)} • ${escapeHtml(APP.patient.email)}</p>
        `;
      }
    }
    if (s) {
      s.innerHTML = `
        <p><strong>Speech:</strong> ${commentLine("voice")}</p>
        <p><strong>Tremor:</strong> ${commentLine("tremor")}</p>
        <p><strong>Gait:</strong> ${commentLine("gait")}</p>
        <p><strong>Facial:</strong> ${commentLine("facial")}</p>
        <p style="opacity:.8;margin-top:10px;">
          Note: This is a prototype engineering report from captured signals; it is not an MDS‑UPDRS clinical rating.
        </p>
      `;
    }
  }

  function commentLine(k) {
    if (!APP.completed[k]) return "Pending.";
    if (APP.scores[k] == null) return "Captured; scoring unavailable (insufficient data).";
    return `Severity proxy ${APP.scores[k]} / 4.`;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  async function downloadFullReportPDF() {
    // Build a PDF that includes:
    // - Patient snapshot
    // - Radar image
    // - Domain metrics lines
    // Uses jsPDF; image from chart toBase64Image(). [web:82]
    await ensureJsPDF();
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { toast("PDF library failed to load."); return; }

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    let y = 44;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("NeuroSynapse‑PD Screening Summary", 40, y);
    y += 18;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, y);
    y += 18;

    pdf.setDrawColor(200);
    pdf.line(40, y, W-40, y);
    y += 18;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Patient", 40, y);
    y += 14;

    pdf.setFont("helvetica", "normal");
    const patientLines = buildPatientLines();
    patientLines.forEach(line => { pdf.text(line, 40, y); y += 14; });

    y += 10;

    // Radar chart
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Radar (severity proxy 0–4)", 40, y);
    y += 10;

    if (APP.radar.chart) {
      const img = APP.radar.chart.toBase64Image("image/png", 1);
      const maxW = W - 80;
      pdf.addImage(img, "PNG", 40, y, maxW, maxW * 0.75);
      y += maxW * 0.75 + 14;
    } else {
      pdf.setFont("helvetica", "normal");
      pdf.text("Radar chart not available (complete at least one test, then open Results).", 40, y);
      y += 18;
    }

    // Domain summary
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Domains", 40, y);
    y += 14;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const dom = [
      `Speech: ${commentLine("voice")}`,
      `Tremor: ${commentLine("tremor")}`,
      `Gait: ${commentLine("gait")}`,
      `Facial: ${commentLine("facial")}`
    ];
    dom.forEach(line => { pdf.text(line, 40, y); y += 14; });

    y += 12;
    pdf.setFontSize(9);
    pdf.text("Disclaimer: Engineering prototype metrics from captured signals; not an MDS‑UPDRS clinical score; not for diagnosis.", 40, y, { maxWidth: W-80 });

    pdf.save("NeuroSynapsePD_Report.pdf");

    // Also export PNG of radar for convenience (requested both)
    if (APP.radar.chart) {
      const url = APP.radar.chart.toBase64Image("image/png", 1);
      downloadDataUrl(url, "NeuroSynapsePD_Radar.png");
    }
  }

  function buildPatientLines() {
    if (!APP.patient) return ["No patient information available."];
    return [
      `Name: ${APP.patient.firstName} ${APP.patient.lastName}`,
      `DOB: ${APP.patient.dob}`,
      `Gender: ${APP.patient.gender}`,
      `Phone: ${APP.patient.cc} ${APP.patient.phone}`,
      `Email: ${APP.patient.email}`,
      APP.patient.medicalId ? `MRN: ${APP.patient.medicalId}` : "MRN: (not provided)"
    ];
  }

  /* ------------------------------
     Fullscreen helper
  ------------------------------ */
  function toggleFullscreen(el) {
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  /* ------------------------------
     Persist / Restore state
  ------------------------------ */
  function persistState() {
    const st = {
      lang: APP.lang,
      voiceEnabled: APP.voiceEnabled,
      tremorUI: APP.tremorUI,
      completed: APP.completed,
      scores: APP.scores,
      metrics: APP.metrics
    };
    localStorage.setItem("ns_pd_state", JSON.stringify(st));
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem("ns_pd_state");
      if (!raw) return;
      const st = JSON.parse(raw);
      if (!st) return;

      if (st.lang) APP.lang = st.lang;
      if (typeof st.voiceEnabled === "boolean") APP.voiceEnabled = st.voiceEnabled;
      if (typeof st.tremorUI === "boolean") APP.tremorUI = st.tremorUI;

      if (st.completed) APP.completed = { ...APP.completed, ...st.completed };
      if (st.scores) APP.scores = { ...APP.scores, ...st.scores };
      if (st.metrics) APP.metrics = { ...APP.metrics, ...st.metrics };

      // restore dangles / toggles
      $("voiceToggle")?.classList.toggle("active", APP.voiceEnabled);
      $("voiceToggle")?.setAttribute("aria-checked", APP.voiceEnabled ? "true" : "false");
      $("tremorToggle")?.classList.toggle("active", APP.tremorUI);
      $("tremorToggle")?.setAttribute("aria-checked", APP.tremorUI ? "true" : "false");

      // restore metric UI if available
      if (APP.metrics.voice) {
        setMetric("jitterValue", APP.metrics.voice.jitterPct, v => v==null ? "--" : v.toFixed(2));
        setMetric("shimmerValue", APP.metrics.voice.shimmerDb, v => v==null ? "--" : v.toFixed(2));
        setMetric("hnrValue", APP.metrics.voice.hnrDb, v => v==null ? "--" : v.toFixed(1));
        setMetric("pitchValue", APP.metrics.voice.pitchHz, v => v==null ? "--" : Math.round(v).toString());
      }
      if (APP.metrics.tremor) {
        setMetric("frequencyValue", APP.metrics.tremor.freqHz, v => v==null ? "--" : v.toFixed(2));
        setMetric("amplitudeValue", APP.metrics.tremor.ampMm, v => v==null ? "--" : v.toFixed(1));
        setMetric("consistencyValue", APP.metrics.tremor.consistencyPct, v => v==null ? "--" : Math.round(v).toString());
        setMetric("severityScore", APP.scores.tremor, v => v==null ? "--" : String(v));
      }
      if (APP.metrics.gait) {
        setMetric("stepCadence", APP.metrics.gait.cadenceSpm, v => v==null ? "--" : Math.round(v).toString());
        setMetric("stepLength", APP.metrics.gait.stepLenCm, v => v==null ? "--" : Math.round(v).toString());
        setMetric("balanceScore", APP.metrics.gait.balanceScore, v => v==null ? "--" : v.toFixed(0));
        setMetric("postureScore", APP.metrics.gait.postureScore, v => v==null ? "--" : v.toFixed(0));
      }
      if (APP.metrics.facial) {
        setMetric("symmetryScore", APP.metrics.facial.symmetryScore, v => v==null ? "--" : Math.round(v).toString());
        setMetric("blinkRate", APP.metrics.facial.blinkRatePerMin, v => v==null ? "--" : Math.round(v).toString());
        setMetric("expressionScore", APP.metrics.facial.expressionScore, v => v==null ? "--" : Math.round(v).toString());
        setMetric("movementScore", APP.metrics.facial.movementScore, v => v==null ? "--" : Math.round(v).toString());
      }

      // enable save buttons based on completion
      if (APP.completed.voice) $("saveVoiceResults") && ($("saveVoiceResults").disabled = false);
      if (APP.completed.tremor) $("saveTremorResults") && ($("saveTremorResults").disabled = false);
      if (APP.completed.gait) $("saveGaitResults") && ($("saveGaitResults").disabled = false);
      if (APP.completed.facial) $("saveFaceResults") && ($("saveFaceResults").disabled = false);

    } catch {}
  }

  /* ------------------------------
     App init
  ------------------------------ */
  function initLocks() {
    // initial locks until patient saved
    ["voice","tremor","gait","facial","results","report"].forEach(v => setNavLocked(v, true));
  }

  function initActions() {
    $("goToPatientBtn")?.addEventListener("click", () => showView("patient"));
  }

  function boot() {
    setVH();
    initLocks();
    initChrome();
    initActions();
    initPatientForm();

    initVoice();
    initTremor();
    initGait();
    initFace();

    restorePatient();
    restoreState();
    translatePage();
    updateProgressUI();
    initSplash();
  }

  document.addEventListener("DOMContentLoaded", boot);

})();