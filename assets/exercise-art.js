(() => {
  'use strict';

  // Small movement sketches, kept text-free so the same art works in both languages.
  const poses = {
    pushup: [[48, 51], [75, 67], [134, 72], [[79, 88, 76, 105], [66, 87, 64, 104]], [[160, 78, 190, 91], [155, 77, 186, 89]]],
    crunch: [[49, 64], [75, 78], [117, 91], [[65, 60, 52, 68], [77, 60, 62, 68]], [[146, 68, 176, 98], [144, 70, 173, 98]]],
    reverse: [[55, 91], [82, 95], [124, 86], [[70, 101, 59, 105], [87, 101, 77, 105]], [[148, 57, 177, 63], [146, 61, 174, 68]]],
    bridge: [[47, 91], [70, 96], [126, 62], [[76, 99, 90, 104], [67, 102, 80, 108]], [[162, 74, 181, 105], [158, 76, 177, 106]]],
    press: [[110, 31], [110, 54], [110, 83], [[87, 47, 85, 24], [133, 47, 135, 24]], [[98, 100, 94, 118], [122, 100, 126, 118]]],
    lateral: [[110, 30], [110, 53], [110, 84], [[83, 56, 59, 54], [137, 56, 161, 54]], [[98, 101, 94, 118], [122, 101, 126, 118]]],
    curl: [[110, 30], [110, 53], [110, 84], [[91, 74, 87, 52], [129, 74, 133, 52]], [[98, 101, 94, 118], [122, 101, 126, 118]]],
    triceps: [[100, 28], [100, 52], [105, 83], [[119, 59, 123, 90], [85, 61, 89, 91]], [[96, 101, 93, 118], [120, 101, 126, 118]]],
    row: [[86, 40], [101, 59], [139, 78], [[101, 84, 114, 91], [91, 77, 94, 99]], [[116, 99, 99, 119], [150, 97, 159, 118]]],
    hinge: [[85, 40], [100, 59], [138, 79], [[102, 83, 109, 101], [90, 80, 96, 102]], [[118, 100, 101, 119], [148, 100, 153, 119]]],
    squat: [[110, 29], [110, 52], [110, 82], [[88, 64, 94, 81], [132, 64, 126, 81]], [[83, 99, 71, 118], [137, 99, 149, 118]]],
    lunge: [[105, 29], [105, 53], [109, 80], [[90, 68, 89, 88], [124, 68, 130, 88]], [[81, 98, 65, 117], [139, 102, 156, 117]]],
    calf: [[110, 28], [110, 52], [110, 83], [[90, 70, 88, 94], [130, 70, 132, 94]], [[98, 100, 95, 112], [122, 100, 126, 112]]],
    sidebend: [[124, 27], [121, 53], [110, 83], [[101, 70, 91, 94], [138, 69, 149, 92]], [[99, 101, 94, 118], [122, 101, 126, 118]]],
    bench: [[48, 88], [74, 92], [128, 92], [[88, 62, 91, 35], [106, 62, 108, 35]], [[155, 84, 180, 109], [151, 87, 175, 109]]],
    seatedPress: [[81, 27], [82, 51], [82, 86], [[63, 47, 62, 23], [100, 47, 102, 23]], [[121, 90, 140, 115], [117, 91, 136, 116]]],
    seatedRow: [[80, 28], [80, 51], [80, 87], [[106, 61, 130, 66], [105, 66, 130, 71]], [[118, 90, 141, 114], [115, 92, 138, 115]]],
    seatedFly: [[81, 28], [82, 52], [82, 86], [[64, 57, 50, 73], [100, 57, 114, 73]], [[121, 90, 140, 115], [117, 91, 136, 116]]],
    seatedCrunch: [[76, 43], [91, 62], [84, 87], [[77, 69, 80, 78], [101, 71, 108, 80]], [[121, 90, 140, 115], [117, 91, 136, 116]]],
    legCurl: [[48, 78], [72, 79], [130, 79], [[60, 98, 54, 106], [74, 97, 70, 107]], [[164, 80, 173, 52], [159, 83, 169, 56]]],
    lat: [[83, 29], [83, 52], [83, 87], [[64, 40, 55, 26], [102, 40, 111, 26]], [[121, 90, 140, 115], [117, 91, 136, 116]]],
    rotation: [[110, 29], [110, 52], [110, 83], [[128, 62, 155, 57], [128, 68, 154, 65]], [[98, 101, 94, 118], [122, 101, 126, 118]]],
    legPress: [[56, 76], [78, 84], [102, 93], [[78, 101, 73, 108], [91, 101, 87, 108]], [[134, 74, 164, 54], [137, 78, 167, 60]]],
    legExtension: [[81, 28], [82, 51], [82, 87], [[67, 69, 63, 90], [97, 69, 100, 89]], [[122, 87, 163, 87], [119, 92, 159, 92]]]
  };

  const videos = {
    WDIpL0pjun0: ['pushup', 'mat'], NIqgTCTd2MM: ['crunch', 'mat'], zQ_IeJkqut8: ['reverse', 'mat'],
    aI2hGzsAMXs: ['press', 'dumbbell'], '6gvmcqr226U': ['row', 'dumbbell'], PzsMitRdI_8: ['lateral', 'dumbbell'],
    'H-rqYm0xSZk': ['row', 'dumbbell'], '7Ni46OtElu8': ['bridge', 'mat'], CkFzgR55gho: ['squat', 'dumbbell'],
    Q2k3kYbtOcI: ['lunge', 'dumbbell'], QFbZevA7dps: ['hinge', 'dumbbell'], wxwY7GXxL4k: ['calf', 'dumbbell'],
    '0kSm6-5m7ek': ['sidebend', 'dumbbell'], Qi5W_9e4Q8M: ['row', 'bench'], ddU72Ce0vzo: ['curl', 'dumbbell'],
    'Wcmg-3iHwjQ': ['lunge', 'dumbbell'], _BlxWSGtGXg: ['hinge', 'bench'], '-NT8jrURSt0': ['bridge', 'dumbbell'],
    z_r6hDOYtO0: ['bench', 'smith'], GcY6TZxfS0k: ['seatedPress', 'machine'], TeFo51Q_Nsc: ['seatedRow', 'machine'],
    JlT2xB92lY8: ['lateral', 'cable'], nMqQNGo4Jtg: ['triceps', 'cable'], vpPjY_2Kq1A: ['seatedFly', 'machine'],
    CNHS2OoUi30: ['seatedCrunch', 'machine'], fUNkEW3N_ug: ['squat', 'smith'], SRJWDaHqJII: ['lunge', 'smith'],
    nmGzbW15qYo: ['hinge', 'smith'], QjNFk4F5dAs: ['legCurl', 'machine'], FNdI5TynYxs: ['calf', 'smith'],
    JGeRYIZdojU: ['lat', 'machine'], NFzTWp2qpiE: ['curl', 'cable'], yCB0KSYFgkE: ['rotation', 'cable'],
    qCR9bN3G1t4: ['legPress', 'machine'], xd9m2S_Rw4s: ['legExtension', 'machine'], SiYiv9lLjdU: ['bridge', 'smith']
  };

  const line = (a, b, color = '#d7e9e9', width = 8) =>
    `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;

  function equipment(kind, pose) {
    if (kind === 'smith') return '<path d="M48 16V116M174 16V116M48 42H174" stroke="#698d98" stroke-width="3" stroke-linecap="round"/><circle cx="48" cy="42" r="5" fill="#9db6bd"/><circle cx="174" cy="42" r="5" fill="#9db6bd"/>';
    if (kind === 'cable') return '<path d="M178 18V115M164 18H187M164 115H187M178 26L144 61" stroke="#698d98" stroke-width="3" fill="none"/><circle cx="178" cy="26" r="5" fill="#91d8d1"/>';
    if (kind === 'machine') {
      const chair = '<path d="M61 80V101H104M104 101V116M160 22V116M150 22H170" stroke="#698d98" stroke-width="4" fill="none" stroke-linecap="round"/>';
      if (pose === 'legCurl' || pose === 'legPress') return '<path d="M48 100H173M61 100V111M156 100V111M177 36V112" stroke="#698d98" stroke-width="4" fill="none"/>';
      return chair;
    }
    if (kind === 'bench') return '<path d="M62 103H158M76 103V116M143 103V116" stroke="#698d98" stroke-width="4" stroke-linecap="round"/>';
    if (kind === 'dumbbell') return '<path d="M49 29h14m-12-5v10m10-10v10M157 29h14m-12-5v10m10-10v10" stroke="#9dc0c4" stroke-width="4" stroke-linecap="round"/>';
    return '';
  }

  window.fitnessExerciseArt = (videoId) => {
    const [name, gear] = videos[videoId] || ['press', 'dumbbell'];
    const [[headX, headY], shoulders, hip, arms, legs] = poses[name];
    const shapes = [
      line(shoulders, hip, '#d7e9e9', 10),
      ...arms.map(([ex, ey, hx, hy], index) => line(shoulders, [ex, ey]) + line([ex, ey], [hx, hy], index ? '#92dcd0' : '#d7e9e9', 7)),
      ...legs.map(([kx, ky, fx, fy], index) => line(hip, [kx, ky]) + line([kx, ky], [fx, fy], index ? '#92dcd0' : '#d7e9e9', 8)),
      `<circle cx="${headX}" cy="${headY}" r="11" fill="#d7e9e9" stroke="#203e45" stroke-width="2"/>`,
      `<circle cx="${shoulders[0]}" cy="${shoulders[1]}" r="5" fill="#91d8d1"/>`,
      `<circle cx="${hip[0]}" cy="${hip[1]}" r="5" fill="#91d8d1"/>`
    ].join('');
    return `<svg class="exercise-art" viewBox="0 0 224 126" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="exercise-bg-${videoId}" x2="1" y2="1"><stop stop-color="#1d343c"/><stop offset="1" stop-color="#2b4d51"/></linearGradient></defs>
      <rect width="224" height="126" rx="8" fill="url(#exercise-bg-${videoId})"/>
      <circle cx="112" cy="62" r="50" fill="#4f8880" opacity=".12"/>
      <path d="M24 119H200" stroke="#55757d" stroke-width="2" stroke-dasharray="3 7"/>
      ${equipment(gear, name)}<g>${shapes}</g>
      <path d="M190 22l8 7-8 7" stroke="#e9bc82" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  };
})();
