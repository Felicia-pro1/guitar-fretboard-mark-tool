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
    scaleDisplayMode: 'chords',
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

let savedMarks = loadSavedMarks();
let contextMenuTarget = null;

function loadSavedMarks() {
    return getDefaultMarks();
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
            createdAt: Date.now() - 36000000
        }
    ];
}

function saveSavedMarks() {
    localStorage.setItem('guitarFretboardMarks', JSON.stringify(savedMarks));
}

function buildMiniFretboard(mark) {
    const stringNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
    const fretCount = mark.maxFret - mark.minFret + 1;
    const htmlParts = [];
    
    htmlParts.push('<div class="mini-chord-diagram"><div class="mini-fretboard">');
    
    for (let stringIndex = 5; stringIndex >= 0; stringIndex--) {
        const openNote = stringNotes[stringIndex];
        const openKey = stringIndex + '_0';
        const hasOpenMark = mark.marks[openKey];
        
        htmlParts.push('<div class="mini-string-row">');
        htmlParts.push('<div class="mini-open-note">');
        if (hasOpenMark) {
            htmlParts.push('<div class="mini-open-marker" style="background: ', mark.marks[openKey], ';">', openNote, '</div>');
        } else {
            htmlParts.push('<span class="mini-open-label">', openNote, '</span>');
        }
        htmlParts.push('</div>');
        htmlParts.push('<div class="mini-fretboard-area">');
        htmlParts.push('<div class="mini-fret-line nut-line"></div>');
        
        for (let i = 0; i < fretCount; i++) {
            const fret = mark.minFret + i;
            const key = stringIndex + '_' + fret;
            const isMarked = mark.marks[key];
            
            htmlParts.push('<div class="mini-fret-box">');
            htmlParts.push('<div class="mini-fret-line"></div>');
            if (isMarked) {
                htmlParts.push('<div class="mini-note-marker" style="background: ', mark.marks[key], ';">', getNoteAtPosition(stringIndex, fret), '</div>');
            }
            if (i === 0 && fret > 0) {
                htmlParts.push('<div class="mini-fret-num">', fret, '</div>');
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
    htmlParts.push('</div></div></div>');
    
    return htmlParts.join('');
}

function renderSavedList() {
    const savedList = document.getElementById('savedList');
    
    if (savedMarks.length === 0) {
        savedList.innerHTML = '<div class="empty-state">暂无保存的标记</div>';
        return;
    }
    
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
    
    const items = [];
    for (let i = 0; i < savedMarks.length; i++) {
        const mark = savedMarks[i];
        const scaleName = scaleNames[mark.scale] || mark.scale;
        const miniFretboard = buildMiniFretboard(mark);
        
        items.push(
            '<div class="saved-item" data-index="', i, '">',
            '<div class="saved-item-header">',
            '<div class="saved-item-title-row">',
            '<button class="expand-icon" onclick="toggleExpand(', i, ')">',
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
            '<path d="M6 9l6 6 6-6"/>',
            '</svg>',
            '</button>',
            '<div class="saved-item-name">', escapeHtml(mark.name), '</div>',
            '<div class="saved-item-scale">', mark.rootNote, scaleName, '</div>',
            '</div>',
            '<div class="saved-item-frets">第 ', mark.minFret, ' - ', mark.maxFret, ' 品</div>',
            '</div>',
            '<div class="saved-item-detail" id="detail-', i, '" style="display: none;">',
            miniFretboard,
            '<div class="saved-item-actions">',
            '<button class="saved-item-btn view" onclick="viewSavedMark(', i, ')">预览</button>',
            '<button class="saved-item-btn edit" onclick="editSavedMark(', i, ')">编辑</button>',
            '<button class="saved-item-btn delete" onclick="confirmDelete(', i, ')">删除</button>',
            '</div>',
            '</div>',
            '</div>'
        );
    }
    
    savedList.innerHTML = items.join('');
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
    const noteBtn = document.querySelector(`.note-btn[data-note="${mark.rootNote}"]`);
    if (noteBtn) {
        noteBtn.classList.add('active');
    }
    
    renderFretboard();
    updateScaleInfo();
}

function editSavedMark(index) {
    const mark = savedMarks[index];
    currentState.markedNotes = { ...mark.marks };
    currentState.editingIndex = index;
    document.getElementById('saveName').value = mark.name;
    document.getElementById('saveMinFret').value = mark.minFret;
    document.getElementById('saveMaxFret').value = mark.maxFret;
    document.querySelector('.tab[data-tab="current"]').click();
    const saveButton = document.getElementById('saveButton');
    saveButton.textContent = '保存修改';
}

function confirmDelete(index) {
    if (confirm(`确定要删除「${savedMarks[index].name}」吗？`)) {
        deleteSavedMark(index);
    }
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
        createdAt: Date.now()
    };
    
    if (currentState.editingIndex !== null) {
        savedMarks[currentState.editingIndex] = markData;
        showToast('修改成功！', 'success');
    } else {
        savedMarks.push(markData);
        showToast('保存成功！', 'success');
    }
    
    saveSavedMarks();
    
    document.getElementById('saveName').value = '';
    document.getElementById('saveMinFret').value = '0';
    document.getElementById('saveMaxFret').value = '22';
    
    currentState.editingIndex = null;
    document.getElementById('saveButton').textContent = '保存';
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
    const newName = prompt('输入新名称:', savedMarks[index].name);
    if (newName && newName.trim()) {
        savedMarks[index].name = newName.trim();
        saveSavedMarks();
        renderSavedList();
    }
}

function deleteSavedMark(index) {
    if (confirm('确定要删除这个保存的标记吗？')) {
        savedMarks.splice(index, 1);
        saveSavedMarks();
        renderSavedList();
    }
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
            currentState.rootNote = button.dataset.note;
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
    
    document.getElementById('saveButton').addEventListener('click', saveCurrentMarks);
    
    initTabListeners();
    initContextMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateNoteButtons();
    renderFretboard();
    updateScaleInfo();
});
