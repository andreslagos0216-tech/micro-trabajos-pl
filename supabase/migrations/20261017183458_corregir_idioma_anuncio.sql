update public.job_posts
set original_lang = 'es'
where title = 'construccion' and original_lang = 'pl';

delete from public.job_translations
where job_id in (select id from public.job_posts where title = 'construccion');
