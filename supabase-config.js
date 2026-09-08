const SUPABASE_URL = 'https://ccspahsozfojnsotktmu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8hqYhcwIVoy7iXLyORzofg_bkc56TrS';

// 初始化客户端（supabase-js CDN 已在 index.html 引入）
let supabaseClient = null;
let supabaseEnabled = false;

try {
    if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY
        && SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        supabaseEnabled = true;
    }
} catch (e) {
    console.warn('[Supabase] 初始化失败，将仅使用本地存储：', e);
}

// ======================================================================
// 设备 ID：本地生成一次，跨设备同步时手动导出/导入
// ======================================================================
const DEVICE_ID_KEY = 'guitarFretboardDeviceId';

function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = 'dev_' + (Date.now().toString(36)) + '_' + (Math.random().toString(36).slice(2, 10));
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

// ======================================================================
// 同步辅助函数：每个 mark 需要稳定 ID
// ======================================================================
function ensureMarkId(mark) {
    if (!mark.id) {
        mark.id = 'mk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }
    return mark.id;
}

// ======================================================================
// 云同步：上传 marks 与 folders
// ======================================================================
async function syncPushAll() {
    if (!supabaseEnabled) return { ok: false, reason: 'supabase_disabled' };
    const deviceId = getDeviceId();

    // 上传 folders
    try {
        const folderRows = savedFolders.map(f => ({
            id: f.id,
            device_id: deviceId,
            name: f.name,
            parent_id: f.parentId || 'root',
            expanded: f.expanded !== false
        }));
        if (folderRows.length > 0) {
            const { error: fErr } = await supabaseClient
                .from('folders')
                .upsert(folderRows, { onConflict: 'id' });
            if (fErr) throw fErr;
        }
    } catch (e) {
        console.error('[Supabase] folders 上传失败：', e);
        return { ok: false, reason: e.message };
    }

    // 上传 marks
    try {
        const markRows = savedMarks.map((m, i) => {
            ensureMarkId(m);
            return {
                id: m.id,
                device_id: deviceId,
                folder_id: m.folderId || 'root',
                name: m.name,
                root_note: m.rootNote,
                scale: m.scale,
                min_fret: m.minFret,
                max_fret: m.maxFret,
                marks: m.marks,
                tuning: m.tuning,
                accidentals: m.accidentals || 'natural',
                labels: m.labels || 'notes',
                note: m.note || '',
                image_url: m.imageUrl || null,
                sort_order: i
            };
        });
        if (markRows.length > 0) {
            const { error: mErr } = await supabaseClient
                .from('marks')
                .upsert(markRows, { onConflict: 'id' });
            if (mErr) throw mErr;
        }
        return { ok: true, count: markRows.length };
    } catch (e) {
        console.error('[Supabase] marks 上传失败：', e);
        return { ok: false, reason: e.message };
    }
}

// ======================================================================
// 云同步：拉取 marks 与 folders
// ======================================================================
async function syncPullAll() {
    if (!supabaseEnabled) return { ok: false, reason: 'supabase_disabled' };
    const deviceId = getDeviceId();

    try {
        const [fRes, mRes] = await Promise.all([
            supabaseClient.from('folders').select('*').eq('device_id', deviceId),
            supabaseClient.from('marks').select('*').eq('device_id', deviceId).order('sort_order', { ascending: true })
        ]);

        if (fRes.error) throw fRes.error;
        if (mRes.error) throw mRes.error;

        // 还原 folders
        if (fRes.data && fRes.data.length > 0) {
            savedFolders = fRes.data.map(row => ({
                id: row.id,
                name: row.name,
                parentId: row.parent_id,
                expanded: row.expanded
            }));
            saveSavedFolders();
        }

        // 还原 marks
        if (mRes.data && mRes.data.length > 0) {
            savedMarks = mRes.data.map(row => ({
                id: row.id,
                name: row.name,
                rootNote: row.root_note,
                scale: row.scale,
                minFret: row.min_fret,
                maxFret: row.max_fret,
                marks: row.marks || {},
                tuning: row.tuning,
                accidentals: row.accidentals,
                labels: row.labels,
                note: row.note || '',
                imageUrl: row.image_url,
                folderId: row.folder_id,
                createdAt: new Date(row.created_at).getTime()
            }));
            saveSavedMarks();
        }
        return { ok: true, folders: fRes.data?.length || 0, marks: mRes.data?.length || 0 };
    } catch (e) {
        console.error('[Supabase] 拉取失败：', e);
        return { ok: false, reason: e.message };
    }
}

// ======================================================================
// 单条 mark 上传（保存时即时同步）
// ======================================================================
async function syncPushMark(mark) {
    if (!supabaseEnabled || !mark) return;
    try {
        ensureMarkId(mark);
        const deviceId = getDeviceId();
        const row = {
            id: mark.id,
            device_id: deviceId,
            folder_id: mark.folderId || 'root',
            name: mark.name,
            root_note: mark.rootNote,
            scale: mark.scale,
            min_fret: mark.minFret,
            max_fret: mark.maxFret,
            marks: mark.marks,
            tuning: mark.tuning,
            accidentals: mark.accidentals || 'natural',
            labels: mark.labels || 'notes',
            note: mark.note || '',
            image_url: mark.imageUrl || null,
            sort_order: savedMarks.indexOf(mark)
        };
        const { error } = await supabaseClient.from('marks').upsert(row, { onConflict: 'id' });
        if (error) console.warn('[Supabase] 单条同步失败：', error.message);
    } catch (e) {
        console.warn('[Supabase] 单条同步异常：', e);
    }
}

// ======================================================================
// 单条 folder 上传
// ======================================================================
async function syncPushFolder(folder) {
    if (!supabaseEnabled || !folder) return;
    try {
        const deviceId = getDeviceId();
        const row = {
            id: folder.id,
            device_id: deviceId,
            name: folder.name,
            parent_id: folder.parentId || 'root',
            expanded: folder.expanded !== false
        };
        const { error } = await supabaseClient.from('folders').upsert(row, { onConflict: 'id' });
        if (error) console.warn('[Supabase] 文件夹同步失败：', error.message);
    } catch (e) {
        console.warn('[Supabase] 文件夹同步异常：', e);
    }
}

// ======================================================================
// 删除云端 mark
// ======================================================================
async function syncDeleteMark(markId) {
    if (!supabaseEnabled || !markId) return;
    try {
        await supabaseClient.from('marks').delete().eq('id', markId);
    } catch (e) {
        console.warn('[Supabase] 删除同步失败：', e);
    }
}

// ======================================================================
// 删除云端 folder
// ======================================================================
async function syncDeleteFolder(folderId) {
    if (!supabaseEnabled || !folderId) return;
    try {
        await supabaseClient.from('folders').delete().eq('id', folderId);
    } catch (e) {
        console.warn('[Supabase] 文件夹删除失败：', e);
    }
}

// ======================================================================
// 上传迷你和弦图 PNG 到 Storage
// 返回公开 URL，失败返回 null
// ======================================================================
async function uploadChordImage(dataUrl, markId) {
    if (!supabaseEnabled || !markId) return null;
    try {
        const deviceId = getDeviceId();
        const path = `${deviceId}/${markId}.png`;
        // dataUrl → Blob
        const resp = await fetch(dataUrl);
        const blob = await resp.blob();
        const { error } = await supabaseClient
            .storage
            .from('chord-images')
            .upload(path, blob, { contentType: 'image/png', upsert: true });
        if (error) throw error;
        const { data } = supabaseClient.storage.from('chord-images').getPublicUrl(path);
        return data.publicUrl;
    } catch (e) {
        console.warn('[Supabase] 图片上传失败：', e);
        return null;
    }
}

// ======================================================================
// 导出 / 导入 device_id（跨设备同步）
// ======================================================================
function exportDeviceId() {
    const id = getDeviceId();
    const ta = document.createElement('textarea');
    ta.value = id;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast('设备 ID 已复制到剪贴板：' + id, 'success');
    } catch (e) {
        prompt('请复制此设备 ID：', id);
    }
    document.body.removeChild(ta);
}

function importDeviceId(newId) {
    if (!newId || !newId.trim()) return;
    localStorage.setItem(DEVICE_ID_KEY, newId.trim());
    showToast('设备 ID 已设置，请点击"从云端拉取"', 'success');
}
