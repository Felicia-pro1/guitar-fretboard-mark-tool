const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SCALES = {
    major: [2, 2, 1, 2, 2, 2, 1],
    naturalMinor: [2, 1, 2, 2, 1, 2, 2],
    harmonicMinor: [2, 1, 2, 2, 1, 3, 1],
    melodicMinor: [2, 1, 2, 2, 2, 2, 1],
    dorian: [2, 1, 2, 2, 2, 1, 2],
    phrygian: [1, 2, 2, 2, 1, 2, 2],
    lydian: [2, 2, 2, 1, 2, 2, 1],
    mixolydian: [2, 2, 1, 2, 2, 1, 2],
    locrian: [1, 2, 2, 1, 2, 2, 2]
};

const SCALE_NAMES = {
    major: 'Major',
    naturalMinor: 'Natural Minor',
    harmonicMinor: 'Harmonic Minor',
    melodicMinor: 'Melodic Minor',
    dorian: 'Dorian',
    phrygian: 'Phrygian',
    lydian: 'Lydian',
    mixolydian: 'Mixolydian',
    locrian: 'Locrian'
};

const TUNINGS = {
    standard: ['E', 'A', 'D', 'G', 'B', 'E'],
    dropD: ['D', 'A', 'D', 'G', 'B', 'E'],
    openG: ['D', 'G', 'D', 'G', 'B', 'D']
};

const CHORD_TYPES = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10],
    min7b5: [0, 3, 6, 9],
    maj7s5: [0, 4, 8, 11],
    dim7: [0, 3, 6, 9]
};

const DIATONIC_CHORDS = {
    major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
    naturalMinor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
    harmonicMinor: ['minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished'],
    melodicMinor: ['minor', 'minor', 'augmented', 'major', 'major', 'diminished', 'diminished'],
    dorian: ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
    phrygian: ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
    lydian: ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
    mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
    locrian: ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor']
};

const DIATONIC_SEVENTH_CHORDS = {
    major: ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'min7b5'],
    naturalMinor: ['min7', 'min7b5', 'maj7', 'min7', 'min7', 'maj7', 'dom7'],
    harmonicMinor: ['min7', 'min7b5', 'maj7s5', 'min7', 'dom7', 'maj7', 'dim7'],
    melodicMinor: ['min7', 'min7', 'maj7s5', 'dom7', 'dom7', 'dim7', 'min7b5'],
    dorian: ['min7', 'min7', 'maj7', 'dom7', 'min7', 'min7b5', 'maj7'],
    phrygian: ['min7', 'maj7', 'dom7', 'min7', 'min7b5', 'maj7', 'min7'],
    lydian: ['maj7', 'maj7', 'min7', 'min7b5', 'dom7', 'min7', 'min7'],
    mixolydian: ['dom7', 'min7', 'min7b5', 'maj7', 'dom7', 'min7', 'min7'],
    locrian: ['min7b5', 'maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7']
};

const CHORD_SYMBOLS = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug',
    maj7: 'maj7',
    min7: 'm7',
    dom7: '7',
    min7b5: 'm7♭5',
    maj7s5: 'maj7#5',
    dim7: 'dim7'
};

let currentState = {
    rootNote: 'C',
    scale: 'major',
    tuning: 'standard',
    accidental: 'natural',
    harmony: 'scale',
    labels: 'notes',
    allNotes: false,
    rootNoteOnly: true,
    minFret: 0,
    maxFret: 22,
    selectedChord: null,
    markMode: true,
    selectedColor: '#e53935',
    markedNotes: {},
    scaleDisplayMode: 'chords',
    seventhMode: false,
    editingIndex: null
};

function getNoteIndex(note) {
    const sharpIndex = NOTES.indexOf(note);
    if (sharpIndex !== -1) return sharpIndex;
    return NOTES_FLAT.indexOf(note);
}

function getNoteName(index, accidental = 'natural', scaleDegree = null) {
    index = index % 12;
    if (index < 0) index += 12;
    
    if (accidental === 'sharp') {
        if (index === 4 && scaleDegree === 6) return 'E#';
        if (index === 0 && scaleDegree === 7) return 'B#';
        return NOTES[index];
    } else if (accidental === 'flat') {
        if (index === 11 && scaleDegree === 7) return 'Cb';
        if (index === 4 && scaleDegree === 4) return 'Fb';
        return NOTES_FLAT[index];
    }
    return NOTES[index];
}

function getScaleNotes(rootNote, scale) {
    const rootIndex = getNoteIndex(rootNote);
    const intervals = SCALES[scale];
    const notes = [];
    let currentIndex = rootIndex;
    
    notes.push(currentIndex);
    for (const interval of intervals.slice(0, -1)) {
        currentIndex += interval;
        notes.push(currentIndex % 12);
    }
    
    return notes;
}

function getDegreeWithAccidental(noteIndex, scaleNotes, rootIndex) {
    const scaleNoteIndex = scaleNotes.indexOf(noteIndex);
    
    if (scaleNoteIndex !== -1) {
        const degree = scaleNoteIndex + 1;
        
        const flatDegrees = {
            naturalMinor: [3, 6, 7],
            dorian: [3],
            phrygian: [2, 3, 6, 7],
            locrian: [2, 3, 5, 6, 7]
        };
        
        if (flatDegrees[currentState.scale] && flatDegrees[currentState.scale].includes(degree)) {
            return 'b' + degree;
        }
        
        return degree.toString();
    }
    
    for (let i = 0; i < scaleNotes.length; i++) {
        const scaleNote = scaleNotes[i];
        const nextScaleNote = scaleNotes[(i + 1) % scaleNotes.length];
        
        const diff = (noteIndex - scaleNote + 12) % 12;
        const nextDiff = (nextScaleNote - noteIndex + 12) % 12;
        
        if (diff === 1) {
            return '#' + (i + 1);
        } else if (nextDiff === 1) {
            return 'b' + ((i + 2) > scaleNotes.length ? 1 : i + 2);
        }
    }
    
    return '?';
}

function getChordNotes(rootNote, chordType) {
    const rootIndex = getNoteIndex(rootNote);
    const intervals = CHORD_TYPES[chordType];
    return intervals.map(interval => (rootIndex + interval) % 12);
}

function getDiatonicChords(rootNote, scale) {
    const scaleNotes = getScaleNotes(rootNote, scale);
    const chordTypes = DIATONIC_CHORDS[scale];
    
    return scaleNotes.map((noteIndex, i) => {
        const noteName = getNoteName(noteIndex, currentState.accidental, i + 1);
        const chordType = chordTypes[i];
        return {
            note: noteName,
            type: chordType,
            degree: i + 1,
            notes: getChordNotes(noteName, chordType)
        };
    });
}

function renderFretboard() {
    const fretboard = document.getElementById('fretboard');
    fretboard.innerHTML = '';
    
    const tuning = TUNINGS[currentState.tuning];
    const scaleNotes = getScaleNotes(currentState.rootNote, currentState.scale);
    const rootIndex = getNoteIndex(currentState.rootNote);
    
    let displayNotes = [];
    let displayRoot = currentState.rootNoteOnly;
    let chordRootIndex = rootIndex;
    let isChordMode = false;
    
    if (currentState.harmony === 'chord' && currentState.selectedChord) {
        const chords = getDiatonicChords(currentState.rootNote, currentState.scale);
        const chord = chords.find(c => c.degree === currentState.selectedChord);
        if (chord) {
            displayNotes = chord.notes;
            chordRootIndex = getNoteIndex(chord.note);
            displayRoot = true;
            isChordMode = true;
            
            // Seventh mode: add 7th note
            if (currentState.seventhMode) {
                const seventhChords = DIATONIC_SEVENTH_CHORDS[currentState.scale] || DIATONIC_SEVENTH_CHORDS.major;
                const seventhType = seventhChords[currentState.selectedChord - 1];
                const seventhIntervals = CHORD_TYPES[seventhType];
                const chordRootIdx = getNoteIndex(chord.note);
                displayNotes = seventhIntervals.map(interval => (chordRootIdx + interval) % 12);
            }
        }
    } else {
        displayNotes = scaleNotes;
    }
    
    const stringsToRender = tuning;
    
    stringsToRender.forEach((openNote, stringIndex) => {
        const stringDiv = document.createElement('div');
        stringDiv.className = 'string';
        
        const openNoteIndex = getNoteIndex(openNote);
        
        const stringLabel = document.createElement('div');
        stringLabel.className = 'string-label';
        stringLabel.textContent = getNoteName(openNoteIndex, currentState.accidental);
        stringDiv.appendChild(stringLabel);
        
        for (let fret = 0; fret <= currentState.maxFret; fret++) {
            if (fret < currentState.minFret) continue;
            
            const fretDiv = document.createElement('div');
            fretDiv.className = 'fret';
            
            if (fret === 0) {
                fretDiv.style.borderRight = '5px solid #d4af37';
            }
            
            if ([3, 5, 7, 9, 15, 17, 19].includes(fret) && stringIndex === 3) {
                const marker = document.createElement('div');
                marker.className = 'fret-marker';
                fretDiv.appendChild(marker);
            }
            
            if (fret === 12) {
                if (stringIndex === 2 || stringIndex === 4) {
                    const marker = document.createElement('div');
                    marker.className = 'fret-marker';
                    fretDiv.appendChild(marker);
                }
            }
            
            const noteIndex = (openNoteIndex + fret) % 12;
            const isInScale = displayNotes.includes(noteIndex);
            const isRoot = noteIndex === chordRootIndex;
            
            let shouldShow = false;
            let noteClass = '';
            
            if (currentState.allNotes) {
                shouldShow = true;
                noteClass = 'all-note';
            }
            
            if (isInScale) {
                shouldShow = true;
                if (isRoot && displayRoot) {
                    noteClass = 'root';
                } else {
                    noteClass = 'scale-note';
                }
            }
            
            const noteKey = `${stringIndex}_${fret}`;
            const isMarked = currentState.markedNotes[noteKey];
            
            if (shouldShow || isMarked) {
                const noteMarker = document.createElement('div');
                noteMarker.className = `note-marker ${noteClass}`;
                
                if (isMarked) {
                    noteMarker.classList.add('marked');
                    noteMarker.style.background = currentState.markedNotes[noteKey];
                    noteMarker.style.boxShadow = `0 0 15px ${currentState.markedNotes[noteKey]}80`;
                }
                
                let label = '';
                if (currentState.labels === 'notes') {
                    const scaleDegree = isInScale ? displayNotes.indexOf(noteIndex) + 1 : null;
                    label = getNoteName(noteIndex, currentState.accidental, scaleDegree);
                } else if (currentState.labels === 'degrees') {
                    const rootIndex = getNoteIndex(currentState.rootNote);
                    label = getDegreeWithAccidental(noteIndex, scaleNotes, rootIndex);
                } else if (currentState.labels === 'intervals') {
                    if (isChordMode) {
                        const chordIntervalNames = ['R', '3', '5'];
                        const degree = displayNotes.indexOf(noteIndex);
                        label = degree >= 0 ? chordIntervalNames[degree] : '';
                    } else {
                        const degree = displayNotes.indexOf(noteIndex);
                        const intervalNames = ['R', '2', '3', '4', '5', '6', '7'];
                        label = degree >= 0 ? intervalNames[degree] : '';
                    }
                }
                
                noteMarker.textContent = label;
                noteMarker.dataset.stringIndex = stringIndex;
                noteMarker.dataset.fret = fret;
                noteMarker.style.cursor = currentState.markMode ? 'pointer' : 'default';
                
                noteMarker.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentState.markMode) {
                        toggleMark(parseInt(e.target.dataset.stringIndex), parseInt(e.target.dataset.fret));
                    }
                });
                
                fretDiv.appendChild(noteMarker);
            }
            
            if (fret > 0) {
                const fretNumber = document.createElement('div');
                fretNumber.className = 'fret-number';
                fretNumber.textContent = fret;
                fretDiv.appendChild(fretNumber);
            }
            
            stringDiv.appendChild(fretDiv);
        }
        
        fretboard.appendChild(stringDiv);
    });
}

function toggleMark(stringIndex, fret) {
    const noteKey = `${stringIndex}_${fret}`;
    if (currentState.markedNotes[noteKey]) {
        delete currentState.markedNotes[noteKey];
    } else {
        currentState.markedNotes[noteKey] = currentState.selectedColor;
    }
    renderFretboard();
    updateFretRangeFromMarks();
}

// 根据当前标记自动识别品记范围并覆盖输入框
function updateFretRangeFromMarks() {
    const frets = Object.keys(currentState.markedNotes).map(key => parseInt(key.split('_')[1]));
    if (frets.length === 0) return;

    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    const minInput = document.getElementById('saveMinFret');
    const maxInput = document.getElementById('saveMaxFret');
    if (minInput) minInput.value = minFret;
    if (maxInput) maxInput.value = maxFret;
}

function updateScaleInfo() {
    const scaleName = document.getElementById('scaleName');
    const scaleContent = document.getElementById('scaleContent');
    
    const rootName = getNoteName(getNoteIndex(currentState.rootNote), currentState.accidental);
    scaleName.textContent = `${rootName} ${SCALE_NAMES[currentState.scale]} Scale`;
    
    const scaleNotes = getScaleNotes(currentState.rootNote, currentState.scale);
    
    if (currentState.seventhMode) {
        // Seventh Chords Mode
        const seventhChords = DIATONIC_SEVENTH_CHORDS[currentState.scale] || DIATONIC_SEVENTH_CHORDS.major;
        let html = '';
        
        seventhChords.forEach((chordType, index) => {
            const noteIndex = scaleNotes[index];
            const noteName = getNoteName(noteIndex, currentState.accidental, index + 1);
            const chordSymbol = getChordSymbol(chordType);
            const intervals = CHORD_TYPES[chordType] || CHORD_TYPES.major;
            
            html += `<div class="chord-column" data-chord="${index + 1}">`;
            html += `<div class="chord-degree">${getRomanNumeral(index + 1, chordType)}</div>`;
            html += `<div class="chord-name">${noteName}${chordSymbol}</div>`;
            
            if (currentState.scaleDisplayMode === 'notes') {
                const chordNotes = intervals.map(interval => (noteIndex + interval) % 12).reverse();
                chordNotes.forEach(cn => {
                    html += `<div class="chord-note">${getNoteName(cn, currentState.accidental)}</div>`;
                });
            } else if (currentState.scaleDisplayMode === 'degrees') {
                const chordNotes = intervals.map(interval => (noteIndex + interval) % 12).reverse();
                const rootIdx = getNoteIndex(currentState.rootNote);
                chordNotes.forEach(cn => {
                    html += `<div class="chord-degree-note">${getDegreeWithAccidental(cn, scaleNotes, rootIdx)}</div>`;
                });
            }
            
            html += '</div>';
        });
        
        scaleContent.innerHTML = html;
    } else {
        // Triad Chords Mode
        const chords = getDiatonicChords(currentState.rootNote, currentState.scale);
        
        let html = '';
        chords.forEach((chord, index) => {
            const isDominant = (index === 4);
            const dominantClass = isDominant ? 'dominant' : '';
            const isSelected = currentState.selectedChord === (index + 1);
            const selectedClass = isSelected ? 'selected' : '';
            
            html += `<div class="chord-column ${dominantClass} ${selectedClass}" data-chord="${index + 1}">`;
            html += `<div class="chord-degree">${getRomanNumeral(index + 1, chord.type)}</div>`;
            html += `<div class="chord-name">${chord.note}${getChordSymbol(chord.type)}</div>`;
            
            if (currentState.scaleDisplayMode === 'notes') {
                const notes = chord.notes;
                const degrees = [
                    (index + 4) % 7 + 1,
                    (index + 2) % 7 + 1,
                    index + 1
                ];
                html += `<div class="chord-note">${getNoteName(notes[2], currentState.accidental, degrees[0])}</div>`;
                html += `<div class="chord-note">${getNoteName(notes[1], currentState.accidental, degrees[1])}</div>`;
                html += `<div class="chord-note">${getNoteName(notes[0], currentState.accidental, degrees[2])}</div>`;
            } else if (currentState.scaleDisplayMode === 'degrees') {
                const notes = chord.notes;
                const rootIndex = getNoteIndex(currentState.rootNote);
                html += `<div class="chord-degree-note">${getDegreeWithAccidental(notes[2], scaleNotes, rootIndex)}</div>`;
                html += `<div class="chord-degree-note">${getDegreeWithAccidental(notes[1], scaleNotes, rootIndex)}</div>`;
                html += `<div class="chord-degree-note">${getDegreeWithAccidental(notes[0], scaleNotes, rootIndex)}</div>`;
            }
            
            html += '</div>';
        });
        
        scaleContent.innerHTML = html;
    }
    
    // Add click listeners for both modes
    document.querySelectorAll('.chord-column').forEach(column => {
        column.addEventListener('click', () => {
            const chordDegree = parseInt(column.dataset.chord);
            if (currentState.selectedChord === chordDegree) {
                currentState.selectedChord = null;
            } else {
                currentState.selectedChord = chordDegree;
                currentState.harmony = 'chord';
            }
            renderFretboard();
            updateScaleInfo();
        });
    });
}

function getRomanNumeral(degree, chordType) {
    const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    return numerals[degree - 1];
}

function getChordSymbol(chordType) {
    const symbols = {
        'major': '',
        'minor': 'm',
        'diminished': 'dim',
        'augmented': 'aug',
        'maj7': 'maj7',
        'min7': 'm7',
        'dom7': '7',
        'min7b5': 'm7♭5',
        'maj7s5': 'maj7#5',
        'dim7': 'dim7'
    };
    return symbols[chordType] || '';
}

function updateNoteButtons() {
    const noteBtns = document.querySelectorAll('.note-btn');
    
    noteBtns.forEach(btn => {
        const note = btn.dataset.note;
        
        if (currentState.accidental === 'sharp') {
            const sharpMap = {
                'C': 'C#',
                'D': 'D#',
                'E': 'E#',
                'F': 'F#',
                'G': 'G#',
                'A': 'A#',
                'B': 'B#'
            };
            btn.dataset.actualNote = sharpMap[note] || note;
            if (note === 'E') btn.dataset.actualNote = 'F';
            else if (note === 'B') btn.dataset.actualNote = 'C';
        } else if (currentState.accidental === 'flat') {
            const flatMap = {
                'C': 'Cb',
                'D': 'Db',
                'E': 'Eb',
                'F': 'Fb',
                'G': 'Gb',
                'A': 'Ab',
                'B': 'Bb'
            };
            btn.dataset.actualNote = flatMap[note] || note;
            if (note === 'C') btn.dataset.actualNote = 'B';
            else if (note === 'F') btn.dataset.actualNote = 'E';
        } else {
            btn.dataset.actualNote = note;
        }
    });
}

const ROOT_FOLDER_ID = 'root';
const MAX_FOLDER_DEPTH = 2;

let savedMarks = loadSavedMarks();
let savedFolders = loadSavedFolders();
let contextMenuTarget = null;
// 当前保存时归属的文件夹 id，'root' 表示未分类
let currentSaveFolderId = 'root';
// 已保存列表的显示列数（由布局按钮控制）
let currentColumns = 3;

function generateFolderId() {
    return 'folder_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

function loadSavedFolders() {
    try {
        const saved = localStorage.getItem('guitarFretboardFolders');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.error('Failed to load folders:', e);
    }
    return [];
}

function saveSavedFolders() {
    localStorage.setItem('guitarFretboardFolders', JSON.stringify(savedFolders));
}

// 触发云端文件夹同步
function cloudSyncFolder(folder) {
    if (typeof syncPushFolder === 'function' && folder) syncPushFolder(folder);
}

// 获取文件夹深度：root=0, 顶层=1, 二级=2
function getFolderDepth(folderId) {
    if (folderId === ROOT_FOLDER_ID) return 0;
    let depth = 0;
    let current = folderId;
    const guard = new Set();
    while (current && current !== ROOT_FOLDER_ID && !guard.has(current)) {
        guard.add(current);
        depth++;
        const folder = savedFolders.find(f => f.id === current);
        if (!folder) break;
        current = folder.parentId;
    }
    return depth;
}

// 获取文件夹下所有子文件夹（直接子级）
function getChildFolders(parentId) {
    return savedFolders.filter(f => f.parentId === parentId);
}

// 获取文件夹下所有项
function getMarksInFolder(folderId) {
    return savedMarks
        .map((m, i) => ({ mark: m, index: i }))
        .filter(({ mark }) => (mark.folderId || ROOT_FOLDER_ID) === folderId);
}

function loadSavedMarks() {
    try {
        const saved = localStorage.getItem('guitarFretboardMarks');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const dataVersion = localStorage.getItem('guitarFretboardVersion') || '1.0';
                const currentVersion = '1.3';

                let needSave = dataVersion !== currentVersion;
                parsed.forEach(mark => {
                    if (!mark.rootNote) mark.rootNote = 'C';
                    if (!mark.scale) mark.scale = 'major';
                    if (!mark.tuning) mark.tuning = 'standard';
                    if (!mark.createdAt) mark.createdAt = Date.now();
                    if (!mark.folderId) mark.folderId = ROOT_FOLDER_ID;
                    // 为旧数据补 id（用于云端同步）
                    if (!mark.id) {
                        mark.id = 'mk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                        needSave = true;
                    }
                });
                if (needSave) {
                    localStorage.setItem('guitarFretboardVersion', currentVersion);
                    localStorage.setItem('guitarFretboardMarks', JSON.stringify(parsed));
                }
                return parsed;
            }
        }
    } catch (e) {
        console.error('Failed to load saved marks:', e);
    }
    localStorage.setItem('guitarFretboardVersion', '1.3');
    const defaults = getDefaultMarks();
    defaults.forEach(m => {
        m.folderId = ROOT_FOLDER_ID;
        m.id = 'mk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8) + '_' + Math.floor(Math.random()*1000);
    });
    return defaults;
}

function getNoteAtPosition(stringIndex, fret) {
    const stringNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const openNote = stringNotes[stringIndex];
    const openIndex = noteNames.indexOf(openNote);
    const noteIndex = (openIndex + fret) % 12;
    
    return noteNames[noteIndex];
}

function getDefaultMarks() {
    return [
        {
            name: 'C大三和弦',
            minFret: 0,
            maxFret: 3,
            marks: {
                '5_0': '#6B4423',
                '4_2': '#D4A76A',
                '3_3': '#8B7355'
            },
            rootNote: 'C',
            scale: 'major',
            tuning: 'standard',
            labels: 'notes',
            createdAt: Date.now() - 86400000
        },
        {
            name: 'G7属七和弦',
            minFret: 3,
            maxFret: 5,
            marks: {
                '5_3': '#6B4423',
                '4_3': '#D4A76A',
                '3_4': '#8B7355',
                '2_5': '#A69076'
            },
            rootNote: 'G',
            scale: 'major',
            tuning: 'standard',
            labels: 'notes',
            createdAt: Date.now() - 72000000
        },
        {
            name: 'Am小和弦',
            minFret: 0,
            maxFret: 2,
            marks: {
                '5_0': '#6B4423',
                '3_2': '#D4A76A',
                '2_2': '#8B7355'
            },
            rootNote: 'A',
            scale: 'naturalMinor',
            tuning: 'standard',
            labels: 'notes',
            createdAt: Date.now() - 36000000
        }
    ];
}

function saveSavedMarks() {
    localStorage.setItem('guitarFretboardMarks', JSON.stringify(savedMarks));
}

// 触发云端同步（异步，失败仅打印日志）
function cloudSyncMark(mark) {
    if (typeof syncPushMark === 'function' && mark) syncPushMark(mark);
}

function buildMiniFretboard(mark) {
    const fretCount = mark.maxFret - mark.minFret + 1;
    const htmlParts = [];
    const startsAtZero = mark.minFret === 0;
    const labels = mark.labels || 'notes';
    const hasNote = mark.note && mark.note.trim() !== '';
    
    const rootIndex = getNoteIndex(mark.rootNote);
    const scaleNotes = getScaleNotes(mark.rootNote, mark.scale);
    
    htmlParts.push('<div class="mini-chord-diagram">');
    htmlParts.push('<button class="mini-note-btn', hasNote ? ' has-note' : '', '" onclick="editNote(', savedMarks.indexOf(mark), ')" title="', hasNote ? '编辑备注' : '添加备注', '">');
    htmlParts.push('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">');
    htmlParts.push('<line x1="12" y1="5" x2="12" y2="19"/>');
    htmlParts.push('<line x1="5" y1="12" x2="19" y2="12"/>');
    htmlParts.push('</svg></button>');
    htmlParts.push('<div class="mini-fretboard', startsAtZero ? ' starts-at-zero' : '', '">');
    
    for (let stringIndex = 5; stringIndex >= 0; stringIndex--) {
        htmlParts.push('<div class="mini-string-row">');
        htmlParts.push('<div class="mini-fretboard-area">');
        
        for (let i = 0; i < fretCount; i++) {
            const fret = mark.minFret + i;
            const key = stringIndex + '_' + fret;
            const isMarked = mark.marks[key];
            
            htmlParts.push('<div class="mini-fret-box">');
            if (isMarked) {
                let label = '';
                if (labels === 'degrees') {
                    const stringNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
                    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                    const openNote = stringNotes[stringIndex];
                    const openIndex = noteNames.indexOf(openNote);
                    const noteIndex = (openIndex + fret) % 12;
                    label = getDegreeWithAccidental(noteIndex, scaleNotes, rootIndex);
                } else {
                    label = getNoteAtPosition(stringIndex, fret);
                }
                htmlParts.push('<div class="mini-note-marker" style="background: ', mark.marks[key], ';">', label, '</div>');
            }
            htmlParts.push('</div>');
        }
        
        htmlParts.push('</div></div>');
    }
    
    htmlParts.push('<div class="mini-fret-numbers">');
    for (let i = 0; i < fretCount; i++) {
        const fret = mark.minFret + i;
        htmlParts.push('<div class="mini-fret-bottom-num">', fret, '</div>');
    }
    htmlParts.push('</div>');

    // 内联备注文本框：失焦自动保存，Esc 取消；无备注时默认隐藏，点击 + 后展开
    const noteEmpty = !hasNote;
    htmlParts.push('<textarea class="mini-chord-note-input', noteEmpty ? ' note-empty' : '', '" data-index="', savedMarks.indexOf(mark), '" placeholder="添加备注..." rows="1">', escapeHtml(mark.note || ''), '</textarea>');

    htmlParts.push('</div></div>');
    
    return htmlParts.join('');
}

function renderSavedList() {
    const savedList = document.getElementById('savedList');
    updateSaveTargetFolderOptions();

    if (savedMarks.length === 0 && savedFolders.length === 0) {
        savedList.innerHTML = '<div class="empty-state">暂无保存的标记</div>';
        return;
    }

    const parts = [];
    const rootItems = getMarksInFolder(ROOT_FOLDER_ID);
    const rootFolders = getChildFolders(ROOT_FOLDER_ID);

    // 渲染顶层文件夹
    rootFolders.forEach(folder => {
        parts.push(renderFolderBlock(folder, 1));
    });

    // 渲染顶层未分类项
    if (rootItems.length > 0) {
        parts.push('<div class="folder-block root-folder">');
        parts.push('<div class="folder-header">');
        parts.push('<div class="folder-title">未分类</div>');
        parts.push('<div class="folder-count">', rootItems.length, ' 项</div>');
        parts.push('</div>');
        parts.push('<div class="folder-content saved-list-grid columns-', currentColumns, '">');
        rootItems.forEach(({ index }) => {
            parts.push(renderSavedItem(index));
        });
        parts.push('</div></div>');
    } else if (rootFolders.length === 0) {
        parts.push('<div class="empty-state">暂无保存的标记</div>');
    }

    savedList.className = 'saved-tree';
    savedList.innerHTML = parts.join('');

    // 渲染后自动调整内联备注文本框高度
    requestAnimationFrame(() => {
        savedList.querySelectorAll('.mini-chord-note-input').forEach(autoGrowNoteInput);
    });
}

// 渲染文件夹区块（递归，受 MAX_FOLDER_DEPTH 限制）
function renderFolderBlock(folder, depth) {
    const childFolders = getChildFolders(folder.id);
    const items = getMarksInFolder(folder.id);
    const expanded = folder.expanded !== false;
    const parts = [];

    parts.push('<div class="folder-block" data-folder-id="', folder.id, '">');
    parts.push('<div class="folder-header" draggable="true" ondragstart="folderDragStart(event, \'', folder.id, '\')" ondragend="folderDragEnd(event)" title="拖拽可移动分类">');
    parts.push('<button class="folder-toggle" onclick="toggleFolder(\'', folder.id, '\')" title="', expanded ? '收起' : '展开', '">');
    parts.push('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="folder-toggle-icon', expanded ? ' expanded' : '', '">');
    parts.push('<path d="M6 9l6 6 6-6"/>');
    parts.push('</svg></button>');
    parts.push('<svg class="folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">');
    parts.push('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>');
    parts.push('</svg>');
    parts.push('<div class="folder-title" ondblclick="renameFolder(\'', folder.id, '\')">', escapeHtml(folder.name), '</div>');
    parts.push('<div class="folder-count">', childFolders.length + items.length, ' 项</div>');
    parts.push('<div class="folder-actions">');
    if (depth < MAX_FOLDER_DEPTH) {
        parts.push('<button class="folder-action-btn" onclick="createSubFolder(\'', folder.id, '\')" title="新建子分类">');
        parts.push('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">');
        parts.push('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>');
        parts.push('<line x1="12" y1="11" x2="12" y2="17"/>');
        parts.push('<line x1="9" y1="14" x2="15" y2="14"/>');
        parts.push('</svg></button>');
    }
    parts.push('<button class="folder-action-btn" onclick="moveFolderPrompt(\'', folder.id, '\')" title="移动分类">');
    parts.push('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">');
    parts.push('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>');
    parts.push('<polyline points="9 14 12 17 15 14"/>');
    parts.push('<line x1="12" y1="11" x2="12" y2="17"/>');
    parts.push('</svg></button>');
    parts.push('<button class="folder-action-btn" onclick="renameFolder(\'', folder.id, '\')" title="重命名">');
    parts.push('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">');
    parts.push('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>');
    parts.push('</svg></button>');
    parts.push('<button class="folder-action-btn delete" onclick="confirmDeleteFolder(\'', folder.id, '\')" title="删除分类">');
    parts.push('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">');
    parts.push('<path d="M3 6h18"/>');
    parts.push('<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>');
    parts.push('<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>');
    parts.push('</svg></button>');
    parts.push('</div></div>');

    parts.push('<div class="folder-content', expanded ? '' : ' collapsed', '">');
    if (childFolders.length === 0 && items.length === 0) {
        parts.push('<div class="folder-empty">此分类为空</div>');
    } else {
        if (childFolders.length > 0) {
            childFolders.forEach(child => {
                parts.push(renderFolderBlock(child, depth + 1));
            });
        }
        if (items.length > 0) {
            parts.push('<div class="saved-list-grid columns-', currentColumns, '">');
            items.forEach(({ index }) => {
                parts.push(renderSavedItem(index));
            });
            parts.push('</div>');
        }
    }
    parts.push('</div></div>');
    return parts.join('');
}

// 渲染单个 saved-item（保留原有结构，data-index 仍是 savedMarks 真实索引）
function renderSavedItem(i) {
    const mark = savedMarks[i];
    const scaleNames = {
        major: '大调',
        naturalMinor: '自然小调',
        harmonicMinor: '和声小调',
        melodicMinor: '旋律小调',
        pentatonicMajor: '大调五声音阶',
        pentatonicMinor: '小调五声音阶',
        blues: '布鲁斯音阶',
        dorian: '多利亚调',
        phrygian: '弗里几亚调',
        lydian: '利底亚调',
        mixolydian: '混合利底亚调',
        locrian: '洛克里亚调'
    };
    const scaleName = scaleNames[mark.scale] || mark.scale;
    const miniFretboard = buildMiniFretboard(mark);

    return [
        '<div class="saved-item" data-index="', i, '" draggable="true" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="drop(event)">',
        '<div class="saved-item-header">',
        '<div class="saved-item-title-row">',
        '<button class="expand-icon" onclick="toggleExpand(', i, ')">',
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M6 9l6 6 6-6"/>',
        '</svg>',
        '</button>',
        '<div class="saved-item-name">', escapeHtml(mark.name), '</div>',
        '<div class="saved-item-scale">', mark.rootNote, scaleName, '</div>',
        '<div class="drag-handle" title="拖拽排序或拖入分类">',
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<line x1="9" y1="8" x2="15" y2="8"/>',
        '<line x1="9" y1="12" x2="15" y2="12"/>',
        '<line x1="9" y1="16" x2="15" y2="16"/>',
        '</svg>',
        '</div>',
        '</div>',
        '<div class="saved-item-frets">第 ', mark.minFret, ' - ', mark.maxFret, ' 品</div>',
        '</div>',
        '<div class="saved-item-detail" id="detail-', i, '" style="display: block;">',
        miniFretboard,
        '<div class="saved-item-actions">',
        '<button class="saved-item-btn view" onclick="viewSavedMark(', i, ')" title="预览">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>',
        '<circle cx="12" cy="12" r="3"/>',
        '</svg>',
        '</button>',
        '<button class="saved-item-btn edit" onclick="editSavedMark(', i, ')" title="编辑">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
        '</svg>',
        '</button>',
        '<button class="saved-item-btn export" onclick="exportChordImage(', i, ', true)" title="导出图片/上传">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
        '<polyline points="17 8 12 3 7 8"/>',
        '<line x1="12" y1="3" x2="12" y2="15"/>',
        '</svg>',
        '</button>',
        '<button class="saved-item-btn move" onclick="moveMarkToFolder(', i, ')" title="移动到分类">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
        '<polyline points="9 14 12 17 15 14"/>',
        '<line x1="12" y1="11" x2="12" y2="17"/>',
        '</svg>',
        '</button>',
        '<button class="saved-item-btn delete" onclick="confirmDelete(', i, ')" title="删除">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M3 6h18"/>',
        '<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>',
        '<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
        '</svg>',
        '</button>',
        '</div>',
        '</div>',
        '</div>'
    ].join('');
}

// 文件夹操作
function createFolder(parentId) {
    if (parentId === undefined) parentId = ROOT_FOLDER_ID;
    const depth = getFolderDepth(parentId) + 1;
    if (depth > MAX_FOLDER_DEPTH) {
        showToast('已达到最大分类层级（' + MAX_FOLDER_DEPTH + ' 层）', 'error');
        return;
    }
    showPromptModal('输入分类名称:', '新分类', (name) => {
        if (!name || !name.trim()) return;
        const folder = {
            id: generateFolderId(),
            name: name.trim(),
            expanded: true,
            parentId: parentId
        };
        savedFolders.push(folder);
        saveSavedFolders();
        cloudSyncFolder(folder);
        renderSavedList();
        showToast('分类创建成功', 'success');
    });
}

function createSubFolder(parentId) {
    createFolder(parentId);
}

function renameFolder(folderId) {
    const folder = savedFolders.find(f => f.id === folderId);
    if (!folder) return;
    showPromptModal('输入新名称:', folder.name, (newName) => {
        if (newName && newName.trim()) {
            folder.name = newName.trim();
            saveSavedFolders();
            cloudSyncFolder(folder);
            renderSavedList();
            showToast('重命名成功', 'success');
        }
    });
}

function toggleFolder(folderId) {
    const folder = savedFolders.find(f => f.id === folderId);
    if (!folder) return;
    folder.expanded = folder.expanded === false;
    saveSavedFolders();
    renderSavedList();
}

function confirmDeleteFolder(folderId) {
    const folder = savedFolders.find(f => f.id === folderId);
    if (!folder) return;

    const childFolders = getChildFolders(folderId);
    const items = getMarksInFolder(folderId);
    const total = childFolders.length + items.length;

    if (total === 0) {
        deleteFolder(folderId, false);
        return;
    }
    const msg = `分类「${folder.name}」中有 ${total} 项内容。\n删除分类后，其中的内容将上移到上级分类。确认删除？`;
    showConfirmModal(msg, () => deleteFolder(folderId, true));
}

function deleteFolder(folderId, cascade) {
    const childFolders = getChildFolders(folderId);
    childFolders.forEach(child => deleteFolder(child.id, true));

    if (cascade) {
        // 文件夹被删除，其下项上移到父级
        const folder = savedFolders.find(f => f.id === folderId);
        const parentId = folder ? folder.parentId : ROOT_FOLDER_ID;
        savedMarks.forEach(mark => {
            if (mark.folderId === folderId) {
                mark.folderId = parentId;
                cloudSyncMark(mark);
            }
        });
    }

    const idx = savedFolders.findIndex(f => f.id === folderId);
    if (idx >= 0) {
        if (typeof syncDeleteFolder === 'function') syncDeleteFolder(folderId);
        savedFolders.splice(idx, 1);
    }
    saveSavedFolders();
    saveSavedMarks();
    renderSavedList();
    showToast('分类已删除', 'success');
}

// 移动项到分类（通过弹窗选择）
function moveMarkToFolder(index) {
    showFolderPickerModal('选择目标分类:', (targetFolderId) => {
        if (targetFolderId === null) return;
        savedMarks[index].folderId = targetFolderId;
        saveSavedMarks();
        cloudSyncMark(savedMarks[index]);
        renderSavedList();
        showToast('已移动到分类', 'success');
    });
}

// ===== 文件夹拖拽移动 =====
let draggedFolderId = null;

function folderDragStart(event, folderId) {
    draggedFolderId = folderId;
    draggedIndex = null;
    event.dataTransfer.effectAllowed = 'move';
    try { event.dataTransfer.setData('text/plain', 'folder:' + folderId); } catch (e) {}
    const header = event.currentTarget;
    header.classList.add('dragging-source');
}

function folderDragEnd() {
    draggedFolderId = null;
    document.querySelectorAll('.folder-block.drag-over').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.folder-header.dragging-source').forEach(el => el.classList.remove('dragging-source'));
}

// 判断 maybeDescendantId 是否位于 ancestorId 的子树中（含自身）
function isDescendantFolder(maybeDescendantId, ancestorId) {
    let current = maybeDescendantId;
    const guard = new Set();
    while (current && current !== ROOT_FOLDER_ID && !guard.has(current)) {
        if (current === ancestorId) return true;
        guard.add(current);
        const f = savedFolders.find(x => x.id === current);
        if (!f) break;
        current = f.parentId;
    }
    return false;
}

// 移动文件夹到新父级，含层级/循环校验，成功返回 true
function moveFolder(folderId, newParentId) {
    if (folderId === newParentId) {
        showToast('不能移动到分类自身', 'error');
        return false;
    }
    const folder = savedFolders.find(f => f.id === folderId);
    if (!folder) return false;
    // 父级未变化：静默返回
    if ((folder.parentId || ROOT_FOLDER_ID) === newParentId) return true;
    // 不能移动到自己的后代中（防止循环）
    if (newParentId !== ROOT_FOLDER_ID && isDescendantFolder(newParentId, folderId)) {
        showToast('不能移动到自身的子分类中', 'error');
        return false;
    }
    // 层级校验：移动后深度 = 目标父级深度 + 1；子树最大深度不得超过 MAX_FOLDER_DEPTH
    const targetParentDepth = newParentId === ROOT_FOLDER_ID ? 0 : getFolderDepth(newParentId);
    const newDepth = targetParentDepth + 1;
    const hasChildFolder = getChildFolders(folderId).length > 0;
    const subtreeMaxDepth = newDepth + (hasChildFolder ? 1 : 0);
    if (subtreeMaxDepth > MAX_FOLDER_DEPTH) {
        showToast('已达到最大分类层级（' + MAX_FOLDER_DEPTH + ' 层）', 'error');
        return false;
    }
    folder.parentId = newParentId;
    folder.expanded = true;
    saveSavedFolders();
    renderSavedList();
    showToast('分类已移动', 'success');
    return true;
}

function handleFolderDrop(event, folderId) {
    const folderBlock = event.target.closest('.folder-block');
    let targetParentId;
    if (!folderBlock || folderBlock.classList.contains('root-folder')) {
        targetParentId = ROOT_FOLDER_ID;
    } else {
        targetParentId = folderBlock.dataset.folderId || ROOT_FOLDER_ID;
    }
    moveFolder(folderId, targetParentId);
}

// 通过弹窗移动文件夹（排除自身及后代）
function moveFolderPrompt(folderId) {
    showFolderPickerModal('选择移动到的分类:', (targetId) => {
        if (targetId === null) return;
        moveFolder(folderId, targetId);
    }, [folderId]);
}

// 更新保存目标下拉框
function updateSaveTargetFolderOptions() {
    const select = document.getElementById('saveTargetFolder');
    if (!select) return;
    const currentValue = currentSaveFolderId;
    const options = ['<option value="', ROOT_FOLDER_ID, '">未分类</option>'];
    const topLevelFolders = getChildFolders(ROOT_FOLDER_ID);
    topLevelFolders.forEach(folder => {
        options.push('<option value="', folder.id, '">', escapeHtml(folder.name), '</option>');
        const subFolders = getChildFolders(folder.id);
        subFolders.forEach(sub => {
            options.push('<option value="', sub.id, '">-- ', escapeHtml(sub.name), '</option>');
        });
    });
    select.innerHTML = options.join('');
    if (savedMarks.some(m => m.folderId === currentValue) || currentValue === ROOT_FOLDER_ID || savedFolders.some(f => f.id === currentValue)) {
        select.value = currentValue;
    } else {
        select.value = ROOT_FOLDER_ID;
        currentSaveFolderId = ROOT_FOLDER_ID;
    }
}

// 文件夹选择弹窗（用于"移动到"操作，excludeIds 中的文件夹及其后代将被排除）
function showFolderPickerModal(title, callback, excludeIds = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    // 收集需要排除的文件夹（自身 + 所有后代）
    const excluded = new Set();
    const collectExcluded = (id) => {
        excluded.add(id);
        getChildFolders(id).forEach(c => collectExcluded(c.id));
    };
    excludeIds.forEach(collectExcluded);

    const folderOptions = [
        { id: ROOT_FOLDER_ID, name: '未分类 / 顶级', depth: 0 }
    ];
    const collect = (parentId, depth) => {
        savedFolders.filter(f => f.parentId === parentId && !excluded.has(f.id)).forEach(f => {
            folderOptions.push({ id: f.id, name: f.name, depth: depth });
            collect(f.id, depth + 1);
        });
    };
    collect(ROOT_FOLDER_ID, 1);

    const optionsHtml = folderOptions.map(opt => {
        const indent = '&nbsp;'.repeat(opt.depth * 4);
        return `<option value="${opt.id}">${indent}${escapeHtml(opt.name)}</option>`;
    }).join('');

    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <select class="folder-picker-select">${optionsHtml}</select>
            <div class="modal-buttons">
                <button class="modal-btn cancel">取消</button>
                <button class="modal-btn confirm">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const select = modal.querySelector('.folder-picker-select');
    modal.querySelector('.cancel').onclick = () => {
        modal.remove();
        callback(null);
    };
    modal.querySelector('.confirm').onclick = () => {
        const value = select.value;
        modal.remove();
        callback(value);
    };
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            callback(null);
        }
    };
}

function viewSavedMark(index) {
    const mark = savedMarks[index];
    currentState.markedNotes = { ...mark.marks };
    currentState.rootNote = mark.rootNote;
    currentState.scale = mark.scale;
    
    if (mark.tuning) {
        currentState.tuning = mark.tuning;
    }
    
    if (document.getElementById('scale')) {
        document.getElementById('scale').value = mark.scale;
    }
    
    document.querySelectorAll('.note-btn').forEach(btn => btn.classList.remove('active'));
    
    const rootNote = mark.rootNote;
    let noteToSelect = rootNote;
    let accidentalToSet = 'natural';
    
    if (rootNote.includes('#')) {
        accidentalToSet = 'sharp';
        noteToSelect = rootNote.replace('#', '');
    } else if (rootNote.startsWith('D') && rootNote.length > 1) {
        accidentalToSet = 'flat';
        noteToSelect = 'D';
    } else if (rootNote.startsWith('E') && rootNote.length > 1) {
        accidentalToSet = 'flat';
        noteToSelect = 'E';
    } else if (rootNote.startsWith('G') && rootNote.length > 1) {
        accidentalToSet = 'flat';
        noteToSelect = 'G';
    } else if (rootNote.startsWith('A') && rootNote.length > 1) {
        accidentalToSet = 'flat';
        noteToSelect = 'A';
    } else if (rootNote.startsWith('B') && rootNote.length > 1) {
        accidentalToSet = 'flat';
        noteToSelect = 'B';
    } else if (rootNote === 'Cb') {
        accidentalToSet = 'flat';
        noteToSelect = 'C';
    } else if (rootNote === 'Fb') {
        accidentalToSet = 'flat';
        noteToSelect = 'F';
    }
    
    currentState.accidental = accidentalToSet;
    document.querySelector(`input[name="accidental"][value="${accidentalToSet}"]`).checked = true;
    updateNoteButtons();

    // 同步标注方式（音名/级数/音程）
    if (mark.labels) {
        currentState.labels = mark.labels;
        const labelRadio = document.querySelector(`input[name="labels"][value="${mark.labels}"]`);
        if (labelRadio) labelRadio.checked = true;
    }

    let noteBtn = document.querySelector(`.note-btn[data-note="${noteToSelect}"]`);
    if (noteBtn) {
        noteBtn.classList.add('active');
        currentState.rootNote = rootNote;
    }

    renderFretboard();
    updateScaleInfo();
}

function editSavedMark(index) {
    const mark = savedMarks[index];
    // 先加载完整预览状态（标记颜色、根音、音阶、调弦、升降号、标注方式并重绘指板）
    viewSavedMark(index);
    currentState.editingIndex = index;
    document.getElementById('saveName').value = mark.name;
    document.getElementById('saveMinFret').value = mark.minFret;
    document.getElementById('saveMaxFret').value = mark.maxFret;
    // 同步目标文件夹下拉框
    currentSaveFolderId = mark.folderId || ROOT_FOLDER_ID;
    updateSaveTargetFolderOptions();
    const targetSelect = document.getElementById('saveTargetFolder');
    if (targetSelect) targetSelect.value = currentSaveFolderId;
    // 自动切换到"当前标记"页，展示已标记的音
    document.querySelector('.tab[data-tab="current"]').click();
    const saveButton = document.getElementById('saveButton');
    saveButton.textContent = '保存修改';
    showToast('已加载标记，可直接点击指板修改', 'success');
}

function confirmDelete(index) {
    showConfirmModal(`确定要删除「${savedMarks[index].name}」吗？`, () => {
        deleteSavedMark(index);
    });
}

function toggleExpand(index) {
    const detail = document.getElementById(`detail-${index}`);
    const icon = document.querySelector(`.saved-item[data-index="${index}"] .expand-icon svg`);
    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        detail.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

let draggedIndex = null;

function showConfirmModal(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="confirm-modal-content">
            <div class="confirm-modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <p>${escapeHtml(message)}</p>
            <div class="confirm-modal-buttons">
                <button class="confirm-cancel">取消</button>
                <button class="confirm-ok">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.confirm-ok').addEventListener('click', () => {
        onConfirm();
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.confirm-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function showPromptModal(message, defaultValue, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'prompt-modal';
    modal.innerHTML = `
        <div class="prompt-modal-content">
            <h3>${escapeHtml(message)}</h3>
            <input type="text" class="prompt-input" value="${escapeHtml(defaultValue || '')}">
            <div class="prompt-modal-buttons">
                <button class="prompt-cancel">取消</button>
                <button class="prompt-ok">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.prompt-ok').addEventListener('click', () => {
        const value = modal.querySelector('.prompt-input').value;
        onConfirm(value);
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.prompt-cancel').addEventListener('click', () => {
        onConfirm(null);
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            onConfirm(null);
            document.body.removeChild(modal);
        }
    });
    
    modal.querySelector('.prompt-input').focus();
}

// 聚焦并定位到某条记录的内联备注文本框（替代原中央弹窗）
function editNote(index) {
    const mark = savedMarks[index];
    if (!mark) return;

    // 若所在分类处于折叠状态，先逐级展开
    let changed = false;
    let cur = mark.folderId || ROOT_FOLDER_ID;
    const ancestors = [];
    while (cur && cur !== ROOT_FOLDER_ID) {
        const f = savedFolders.find(x => x.id === cur);
        if (!f) break;
        ancestors.push(f);
        cur = f.parentId;
    }
    ancestors.forEach(f => {
        if (f.expanded === false) { f.expanded = true; changed = true; }
    });
    if (changed) {
        saveSavedFolders();
        renderSavedList();
    }

    const ta = document.querySelector('.mini-chord-note-input[data-index="' + index + '"]');
    if (!ta) return;
    // 无备注时先展开 textarea（移除隐藏类）
    ta.classList.remove('note-empty');
    autoGrowNoteInput(ta);
    ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
    }, 350);
}

// 备注文本框自动增高
function autoGrowNoteInput(ta) {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
}

// 失焦自动保存备注（局部更新，不重绘列表）
function saveNoteFromTextarea(ta) {
    const idx = parseInt(ta.dataset.index);
    if (isNaN(idx) || !savedMarks[idx]) return;
    const newNote = ta.value.trim();
    const oldNote = savedMarks[idx].note || '';
    // 内容为空时隐藏文本框（无论是否变化）
    if (newNote === '') {
        ta.classList.add('note-empty');
    }
    if (newNote === oldNote) return;
    savedMarks[idx].note = newNote;
    saveSavedMarks();
    // 局部更新 + 按钮高亮状态，避免整列表重绘造成抖动
    const item = ta.closest('.saved-item');
    if (item) {
        const btn = item.querySelector('.mini-note-btn');
        if (btn) {
            btn.classList.toggle('has-note', newNote !== '');
            btn.title = newNote !== '' ? '编辑备注' : '添加备注';
        }
    }
    showToast('备注已保存', 'success');
}

function dragStart(event) {
    draggedIndex = parseInt(event.target.dataset.index);
    draggedFolderId = null;
    event.target.style.opacity = '0.5';
    event.dataTransfer.effectAllowed = 'move';
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // 清空所有高亮，仅高亮当前文件夹
    document.querySelectorAll('.folder-block.drag-over').forEach(el => el.classList.remove('drag-over'));
    const folderBlock = event.target.closest('.folder-block');
    if (folderBlock) {
        // 拖动文件夹时，不高亮其自身
        if (draggedFolderId && folderBlock.dataset.folderId === draggedFolderId) return;
        folderBlock.classList.add('drag-over');
    }
}

function drop(event) {
    event.preventDefault();
    document.querySelectorAll('.folder-block.drag-over').forEach(el => el.classList.remove('drag-over'));

    // 文件夹拖拽
    if (draggedFolderId) {
        handleFolderDrop(event, draggedFolderId);
        draggedFolderId = null;
        return;
    }

    if (draggedIndex === null) return;

    // 优先判断是否拖入文件夹区块
    const folderBlock = event.target.closest('.folder-block');
    if (folderBlock) {
        let targetFolderId;
        if (folderBlock.classList.contains('root-folder')) {
            targetFolderId = ROOT_FOLDER_ID;
        } else {
            targetFolderId = folderBlock.dataset.folderId || ROOT_FOLDER_ID;
        }
        savedMarks[draggedIndex].folderId = targetFolderId;
        saveSavedMarks();
        renderSavedList();
        showToast('已移动到分类', 'success');
        draggedIndex = null;
        return;
    }

    // 拖入到其他项：保留原数组顺序交换逻辑，并同步 folderId
    const target = event.target.closest('.saved-item');
    if (!target) {
        draggedIndex = null;
        return;
    }
    const dropIndex = parseInt(target.dataset.index);
    if (draggedIndex !== dropIndex) {
        const targetFolderId = savedMarks[dropIndex].folderId || ROOT_FOLDER_ID;
        const draggedItem = savedMarks.splice(draggedIndex, 1)[0];
        draggedItem.folderId = targetFolderId;
        savedMarks.splice(dropIndex, 0, draggedItem);
        saveSavedMarks();
        renderSavedList();
    }

    draggedIndex = null;
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function saveCurrentMarks() {
    const name = document.getElementById('saveName').value.trim();
    const minFret = parseInt(document.getElementById('saveMinFret').value) || 0;
    const maxFret = parseInt(document.getElementById('saveMaxFret').value) || 22;
    
    if (!name) {
        showToast('请输入名称', 'error');
        return;
    }
    
    if (minFret > maxFret) {
        showToast('起始品不能大于结束品', 'error');
        return;
    }
    
    const filteredMarks = {};
    Object.keys(currentState.markedNotes).forEach(key => {
        const parts = key.split('_');
        const fret = parseInt(parts[1]);
        if (fret >= minFret && fret <= maxFret) {
            filteredMarks[key] = currentState.markedNotes[key];
        }
    });
    
    if (Object.keys(filteredMarks).length === 0) {
        showToast('没有标记可保存', 'error');
        return;
    }
    
    const markData = {
        name,
        minFret,
        maxFret,
        marks: filteredMarks,
        rootNote: currentState.rootNote,
        scale: currentState.scale,
        tuning: currentState.tuning,
        labels: currentState.labels,
        note: '',
        folderId: currentSaveFolderId,
        createdAt: Date.now()
    };

    if (currentState.editingIndex !== null) {
        // 编辑时保留原 note、folderId 与云端 id（如果有）
        markData.note = savedMarks[currentState.editingIndex].note || '';
        markData.folderId = currentSaveFolderId;
        markData.id = savedMarks[currentState.editingIndex].id || ('mk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8));
        markData.imageUrl = savedMarks[currentState.editingIndex].imageUrl;
        savedMarks[currentState.editingIndex] = markData;
        showToast('修改成功！', 'success');
    } else {
        markData.id = 'mk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        savedMarks.push(markData);
        showToast('保存成功！', 'success');
    }

    saveSavedMarks();
    cloudSyncMark(markData);

    document.getElementById('saveName').value = '';
    document.getElementById('saveMinFret').value = '0';
    document.getElementById('saveMaxFret').value = '22';

    currentState.editingIndex = null;
    document.getElementById('saveButton').textContent = '保存';
    renderSavedList();
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function renameSavedMark(index) {
    showPromptModal('输入新名称:', savedMarks[index].name, (newName) => {
        if (newName && newName.trim()) {
            savedMarks[index].name = newName.trim();
            saveSavedMarks();
            renderSavedList();
        }
    });
}

function deleteSavedMark(index) {
    showConfirmModal('确定要删除这个保存的标记吗？', () => {
        const mark = savedMarks[index];
        if (mark && mark.id && typeof syncDeleteMark === 'function') syncDeleteMark(mark.id);
        savedMarks.splice(index, 1);
        saveSavedMarks();
        renderSavedList();
    });
}

// ======================================================================
// 迷你和弦图导出 PNG（用 html2canvas 渲染 .mini-chord-diagram）
// 流程：克隆节点 → 移除按钮等干扰元素 → html2canvas → dataURL
// 选项：upload=true 上传到 Supabase Storage；否则仅下载
// ======================================================================
async function exportChordImage(index, upload = true) {
    const mark = savedMarks[index];
    if (!mark) return;
    if (typeof html2canvas === 'undefined') {
        showToast('图片导出库未加载（html2canvas）', 'error');
        return;
    }
    const diagram = document.querySelector('.saved-item[data-index="' + index + '"] .mini-chord-diagram');
    if (!diagram) {
        showToast('找不到和弦图元素', 'error');
        return;
    }
    showToast('正在生成图片...', 'success');

    try {
        // 克隆节点，移除按钮和文本框，避免出现在图片里
        const clone = diagram.cloneNode(true);
        const tempWrap = document.createElement('div');
        tempWrap.style.position = 'fixed';
        tempWrap.style.left = '-9999px';
        tempWrap.style.top = '0';
        tempWrap.style.background = '#FEFDFB';
        tempWrap.style.padding = '12px';
        tempWrap.appendChild(clone);
        // 移除交互元素
        clone.querySelectorAll('.mini-note-btn, .mini-chord-note-input').forEach(el => el.remove());
        document.body.appendChild(tempWrap);

        const canvas = await html2canvas(clone, { backgroundColor: '#FEFDFB', scale: 2 });
        document.body.removeChild(tempWrap);

        const dataUrl = canvas.toDataURL('image/png');

        if (upload && typeof uploadChordImage === 'function' && mark.id) {
            showToast('正在上传...', 'success');
            const publicUrl = await uploadChordImage(dataUrl, mark.id);
            if (publicUrl) {
                mark.imageUrl = publicUrl;
                saveSavedMarks();
                cloudSyncMark(mark);
                showToast('图片已上传，链接已复制', 'success');
                try {
                    await navigator.clipboard.writeText(publicUrl);
                } catch (e) {}
                // 在新窗口打开图片，便于查看
                window.open(publicUrl, '_blank');
            } else {
                // 上传失败则降级为下载
                downloadImage(dataUrl, mark.name + '.png');
                showToast('上传失败，已下载本地', 'error');
            }
        } else {
            downloadImage(dataUrl, mark.name + '.png');
            showToast('图片已下载', 'success');
        }
    } catch (e) {
        console.error('图片导出失败:', e);
        showToast('图片导出失败: ' + e.message, 'error');
    }
}

function downloadImage(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ======================================================================
// 云同步：全量上传 / 全量拉取
// ======================================================================
async function cloudPushAll() {
    if (typeof syncPushAll !== 'function') {
        showToast('云同步未启用（需配置 Supabase）', 'error');
        return;
    }
    showToast('正在上传到云端...', 'success');
    const r = await syncPushAll();
    if (r.ok) {
        showToast('已上传 ' + r.count + ' 项到云端', 'success');
    } else if (r.reason === 'supabase_disabled') {
        showToast('云同步未启用（需配置 Supabase）', 'error');
    } else {
        showToast('上传失败：' + r.reason, 'error');
    }
}

async function cloudPullAll() {
    if (typeof syncPullAll !== 'function') {
        showToast('云同步未启用（需配置 Supabase）', 'error');
        return;
    }
    showConfirmModal('从云端拉取将覆盖本地数据，确定继续？', async () => {
        showToast('正在从云端拉取...', 'success');
        const r = await syncPullAll();
        if (r.ok) {
            renderSavedList();
            showToast('已拉取 ' + r.marks + ' 项标记、' + r.folders + ' 个分类', 'success');
        } else if (r.reason === 'supabase_disabled') {
            showToast('云同步未启用（需配置 Supabase）', 'error');
        } else {
            showToast('拉取失败：' + r.reason, 'error');
        }
    });
}

function showCloudSyncModal() {
    if (typeof getDeviceId !== 'function') {
        showToast('云同步未启用', 'error');
        return;
    }
    const deviceId = getDeviceId();
    const enabled = typeof supabaseEnabled !== 'undefined' && supabaseEnabled;
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="confirm-modal-content" style="max-width: 480px;">
            <h3 style="margin:0 0 12px;color:#6B4423;">云同步设置</h3>
            <p style="font-size:0.85rem;color:#A69076;margin-bottom:14px;">状态：${enabled ? '已启用' : '未启用（需配置 supabase-config.js）'}</p>
            <div style="font-size:0.85rem;margin-bottom:6px;color:#6B4423;">本设备 ID：</div>
            <div style="font-family:monospace;font-size:0.8rem;padding:8px;background:#F5EEE6;border-radius:6px;word-break:break-all;margin-bottom:14px;">${escapeHtml(deviceId)}</div>
            <p style="font-size:0.8rem;color:#A69076;margin-bottom:14px;line-height:1.5;">跨设备同步：在另一台设备点击"导入设备 ID"，粘贴此 ID，然后"从云端拉取"。</p>
            <div class="confirm-modal-buttons">
                <button class="confirm-cancel">关闭</button>
                <button class="cloud-push" style="background:#6B4423;color:#fff;">全量上传</button>
                <button class="cloud-pull" style="background:#D4A76A;color:#6B4423;">从云端拉取</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.confirm-cancel').addEventListener('click', () => document.body.removeChild(modal));
    modal.querySelector('.cloud-push').addEventListener('click', async () => {
        document.body.removeChild(modal);
        await cloudPushAll();
    });
    modal.querySelector('.cloud-pull').addEventListener('click', async () => {
        document.body.removeChild(modal);
        await cloudPullAll();
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

function showImportDeviceIdModal() {
    showPromptModal('粘贴设备 ID：', '', (newId) => {
        if (newId && newId.trim()) {
            importDeviceId(newId.trim());
        }
    });
}

function initTabListeners() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}Panel`).classList.add('active');
            
            if (tab.dataset.tab === 'saved') {
                renderSavedList();
            }
        });
    });
}

function initContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    
    document.addEventListener('click', (e) => {
        contextMenu.classList.remove('show');
    });
    
    document.addEventListener('contextmenu', (e) => {
        const noteMarker = e.target.closest('.note-marker.marked');
        if (noteMarker) {
            e.preventDefault();
            contextMenuTarget = noteMarker;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.add('show');
        }
    });
    
    document.getElementById('ctxDelete').addEventListener('click', () => {
        if (contextMenuTarget) {
            const string = contextMenuTarget.dataset.stringIndex;
            const fret = contextMenuTarget.dataset.fret;
            const key = `${string}_${fret}`;
            delete currentState.markedNotes[key];
            renderFretboard();
        }
        document.getElementById('contextMenu').classList.remove('show');
        contextMenuTarget = null;
    });
    
    document.getElementById('ctxCancel').addEventListener('click', () => {
        document.getElementById('contextMenu').classList.remove('show');
        contextMenuTarget = null;
    });
}

function initEventListeners() {
    const noteButtons = document.querySelectorAll('.note-btn');
    const scaleSelect = document.getElementById('scale');
    const tuningSelect = document.getElementById('tuning');
    const accidentalRadios = document.querySelectorAll('input[name="accidental"]');
    const harmonyRadios = document.querySelectorAll('input[name="harmony"]');
    const labelRadios = document.querySelectorAll('input[name="labels"]');
    const displayModeRadios = document.querySelectorAll('input[name="displayMode"]');
    const minFretSlider = document.getElementById('minFret');
    const maxFretSlider = document.getElementById('maxFret');
    const fretRangeDisplay = document.getElementById('fretRangeDisplay');

    noteButtons.forEach(button => {
        button.addEventListener('click', () => {
            noteButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentState.rootNote = button.dataset.actualNote || button.dataset.note;
            renderFretboard();
            updateScaleInfo();
        });
    });

    scaleSelect.addEventListener('change', () => {
        currentState.scale = scaleSelect.value;
        renderFretboard();
        updateScaleInfo();
    });

    if (tuningSelect) {
        tuningSelect.addEventListener('change', () => {
            currentState.tuning = tuningSelect.value;
            renderFretboard();
        });
    }

    accidentalRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentState.accidental = radio.value;
            updateNoteButtons();
            renderFretboard();
            updateScaleInfo();
        });
    });

    harmonyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentState.harmony = radio.value;
            renderFretboard();
        });
    });

    labelRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentState.labels = radio.value;
            renderFretboard();
        });
    });

    displayModeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentState.allNotes = radio.value === 'allNotes';
            currentState.rootNoteOnly = radio.value === 'rootNote';
            renderFretboard();
        });
    });

    minFretSlider?.addEventListener('input', () => {
        currentState.minFret = parseInt(minFretSlider.value);
        if (currentState.minFret > currentState.maxFret) {
            currentState.maxFret = currentState.minFret;
            maxFretSlider.value = currentState.minFret;
        }
        fretRangeDisplay.textContent = `${currentState.minFret} - ${currentState.maxFret}`;
        renderFretboard();
    });

    maxFretSlider?.addEventListener('input', () => {
        currentState.maxFret = parseInt(maxFretSlider.value);
        if (currentState.maxFret < currentState.minFret) {
            currentState.minFret = currentState.maxFret;
            minFretSlider.value = currentState.maxFret;
        }
        fretRangeDisplay.textContent = `${currentState.minFret} - ${currentState.maxFret}`;
        renderFretboard();
    });

    const colorDots = document.querySelectorAll('.color-dot');
    
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentState.selectedColor = dot.dataset.color;
        });
    });

    document.querySelectorAll('input[name="scaleMode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            currentState.scaleDisplayMode = radio.value;
            
            if (radio.value === 'notes') {
                currentState.labels = 'notes';
            } else if (radio.value === 'degrees') {
                currentState.labels = 'degrees';
            }
            
            renderFretboard();
            updateScaleInfo();
        });
    });
    
    const seventhToggle = document.getElementById('seventhMode');
    if (seventhToggle) {
        seventhToggle.addEventListener('change', () => {
            currentState.seventhMode = seventhToggle.checked;
            renderFretboard();
            updateScaleInfo();
        });
    }
    
    document.getElementById('saveButton').addEventListener('click', saveCurrentMarks);
    document.getElementById('clearButton').addEventListener('click', clearMarks);

    const newFolderBtn = document.getElementById('newFolderBtn');
    if (newFolderBtn) {
        newFolderBtn.addEventListener('click', () => createFolder(ROOT_FOLDER_ID));
    }

    const saveTargetFolder = document.getElementById('saveTargetFolder');
    if (saveTargetFolder) {
        saveTargetFolder.addEventListener('change', (e) => {
            currentSaveFolderId = e.target.value || ROOT_FOLDER_ID;
        });
    }

    // 内联备注文本框：失焦自动保存 / Esc 取消 / Ctrl+Enter 保存 / 输入自动增高
    const savedListEl = document.getElementById('savedList');
    if (savedListEl) {
        savedListEl.addEventListener('focusout', (e) => {
            const ta = e.target.closest && e.target.closest('.mini-chord-note-input');
            if (ta) saveNoteFromTextarea(ta);
        });
        savedListEl.addEventListener('keydown', (e) => {
            const ta = e.target.closest && e.target.closest('.mini-chord-note-input');
            if (!ta) return;
            if (e.key === 'Escape') {
                const idx = parseInt(ta.dataset.index);
                const restoredNote = (savedMarks[idx] && savedMarks[idx].note) || '';
                ta.value = restoredNote;
                autoGrowNoteInput(ta);
                // 取消后若原备注为空，再次隐藏文本框
                if (restoredNote === '') ta.classList.add('note-empty');
                ta.blur();
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                ta.blur();
            }
        });
        savedListEl.addEventListener('input', (e) => {
            const ta = e.target.closest && e.target.closest('.mini-chord-note-input');
            if (ta) autoGrowNoteInput(ta);
        });
    }

    initTabListeners();
    initContextMenu();

    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const columns = parseInt(btn.dataset.columns) || 3;
            currentColumns = columns;
            renderSavedList();
        });
    });
}

function clearMarks() {
    currentState.markedNotes = {};
    renderFretboard();
    showToast('已清空所有标记', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateNoteButtons();
    renderFretboard();
    updateScaleInfo();
});
