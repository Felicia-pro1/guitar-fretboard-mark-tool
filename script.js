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
    augmented: [0, 4, 8]
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

const CHORD_SYMBOLS = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug'
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
    scaleDisplayMode: 'chords'
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
}

function updateScaleInfo() {
    const scaleName = document.getElementById('scaleName');
    const scaleContent = document.getElementById('scaleContent');
    
    const rootName = getNoteName(getNoteIndex(currentState.rootNote), currentState.accidental);
    scaleName.textContent = `${rootName} ${SCALE_NAMES[currentState.scale]} Scale`;
    
    const chords = getDiatonicChords(currentState.rootNote, currentState.scale);
    const scaleNotes = getScaleNotes(currentState.rootNote, currentState.scale);
    
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
        'diminished': 'dim'
    };
    return symbols[chordType] || '';
}

function updateNoteButtons() {
    const noteBtns = document.querySelectorAll('.note-btn');
    
    noteBtns.forEach(btn => {
        const note = btn.dataset.note;
        if (currentState.accidental === 'sharp') {
            if (note === 'C') {
                btn.textContent = 'C#';
                btn.dataset.actualNote = 'C#';
            } else if (note === 'D') {
                btn.textContent = 'D#';
                btn.dataset.actualNote = 'D#';
            } else if (note === 'E') {
                btn.textContent = 'E#';
                btn.dataset.actualNote = 'F';
            } else if (note === 'F') {
                btn.textContent = 'F#';
                btn.dataset.actualNote = 'F#';
            } else if (note === 'G') {
                btn.textContent = 'G#';
                btn.dataset.actualNote = 'G#';
            } else if (note === 'A') {
                btn.textContent = 'A#';
                btn.dataset.actualNote = 'A#';
            } else if (note === 'B') {
                btn.textContent = 'B#';
                btn.dataset.actualNote = 'C';
            }
        } else if (currentState.accidental === 'flat') {
            if (note === 'C') {
                btn.textContent = 'Cb';
                btn.dataset.actualNote = 'B';
            } else if (note === 'D') {
                btn.textContent = 'Db';
                btn.dataset.actualNote = 'Db';
            } else if (note === 'E') {
                btn.textContent = 'Eb';
                btn.dataset.actualNote = 'Eb';
            } else if (note === 'F') {
                btn.textContent = 'Fb';
                btn.dataset.actualNote = 'E';
            } else if (note === 'G') {
                btn.textContent = 'Gb';
                btn.dataset.actualNote = 'Gb';
            } else if (note === 'A') {
                btn.textContent = 'Ab';
                btn.dataset.actualNote = 'Ab';
            } else if (note === 'B') {
                btn.textContent = 'Bb';
                btn.dataset.actualNote = 'Bb';
            }
        } else {
            btn.textContent = note;
            btn.dataset.actualNote = note;
        }
    });
}

function initEventListeners() {
    document.querySelectorAll('.note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.note-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentState.rootNote = btn.dataset.actualNote || btn.dataset.note;
            currentState.selectedChord = null;
            renderFretboard();
            updateScaleInfo();
        });
    });
    
    document.querySelector('.note-btn[data-note="C"]').classList.add('active');
    document.querySelector('.note-btn[data-note="C"]').dataset.actualNote = 'C';
    
    document.querySelectorAll('input[name="accidental"]').forEach(radio => {
        radio.addEventListener('change', () => {
            currentState.accidental = radio.value;
            updateNoteButtons();
            renderFretboard();
            updateScaleInfo();
        });
    });
    
    document.getElementById('scale').addEventListener('change', (e) => {
        currentState.scale = e.target.value;
        currentState.selectedChord = null;
        renderFretboard();
        updateScaleInfo();
    });
    
    document.querySelectorAll('input[name="displayMode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'allNotes') {
                currentState.allNotes = true;
                currentState.rootNoteOnly = false;
            } else {
                currentState.allNotes = false;
                currentState.rootNoteOnly = true;
            }
            renderFretboard();
        });
    });
    
    const colorDots = document.querySelectorAll('.color-dot');
    const clearMarks = document.getElementById('clearMarks');
    
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentState.selectedColor = dot.dataset.color;
        });
    });
    
    clearMarks.addEventListener('click', () => {
        currentState.markedNotes = {};
        renderFretboard();
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
}

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateNoteButtons();
    renderFretboard();
    updateScaleInfo();
});
