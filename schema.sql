-- ======================================================================
-- Guitar Fretboard Mark Tool - Supabase Schema
-- 在 Supabase Dashboard → SQL Editor 中执行本脚本
-- ======================================================================

-- 1. 文件夹表 -----------------------------------------------------------
create table if not exists public.folders (
    id text primary key,
    device_id text not null,
    name text not null,
    parent_id text not null default 'root',
    expanded boolean default true,
    created_at timestamptz default now()
);

-- 2. 标记表 -------------------------------------------------------------
create table if not exists public.marks (
    id text primary key,                      -- 客户端生成的 UUID
    device_id text not null,
    folder_id text default 'root',
    name text,
    root_note text default 'C',
    scale text default 'major',
    min_fret int default 0,
    max_fret int default 22,
    marks jsonb default '{}',                 -- { "0_5": "#3B82F6", ... }
    tuning jsonb default '"standard"',
    accidentals text default 'natural',
    labels text default 'notes',
    note text,
    image_url text,                           -- Supabase Storage 公开 URL
    sort_order int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. 图片存储桶 ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('chord-images', 'chord-images', true)
on conflict (id) do nothing;

-- 4. 行级安全策略（RLS）-------------------------------------------------
-- 注意：本项目无用户认证，按 device_id 进行逻辑隔离
-- 任何访客都能 SELECT（用于跨设备读取自己的数据）
-- 写操作也应放开（安全性依赖 device_id 保密，详见 README）

alter table public.marks enable row level security;
alter table public.folders enable row level security;

-- marks 策略：完全公开（单人/个人使用场景）
drop policy if exists "marks_all" on public.marks;
create policy "marks_all" on public.marks for all using (true) with check (true);

-- folders 策略：完全公开
drop policy if exists "folders_all" on public.folders;
create policy "folders_all" on public.folders for all using (true) with check (true);

-- 5. Storage 策略 ------------------------------------------------------
-- 公开读（图片可被任何访问者查看）
drop policy if exists "images_read" on storage.objects;
create policy "images_read" on storage.objects for select using (bucket_id = 'chord-images');

-- 公开写（上传图片）
drop policy if exists "images_insert" on storage.objects;
create policy "images_insert" on storage.objects for insert with check (bucket_id = 'chord-images');

-- 公开删除（替换/更新图片）
drop policy if exists "images_update" on storage.objects;
create policy "images_update" on storage.objects for update using (bucket_id = 'chord-images');

-- 6. 更新时间触发器（可选，便于调试）-----------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_marks_updated on public.marks;
create trigger trigger_marks_updated
    before update on public.marks
    for each row execute function public.set_updated_at();
