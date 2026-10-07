-- Local seed data for manual testing. Loaded by `npm run db:reset` (supabase db reset).
-- Never applied to the hosted project: `supabase db push` only seeds with --include-seed.
--
-- Log in as tutor@example.test / password123.
-- All names and contact details are made up.

do $$
declare
  v_tutor constant uuid := '5eed0000-0000-4000-8000-000000000001';

  v_taylor uuid;
  v_smith uuid;
  v_brown uuid;
  v_wilson uuid;
  v_evans uuid;
  v_thomas uuid;
  v_hughes uuid;
  v_johnson uuid;
  v_roberts uuid;

  v_year_11 uuid;
  v_eleven_plus uuid;
  v_exam_soon uuid;
  v_online uuid;
  v_in_person uuid;
begin
  -- Tutor login ----------------------------------------------------------------

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  )
  values (
    '00000000-0000-0000-0000-000000000000', v_tutor, 'authenticated', 'authenticated',
    'tutor@example.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"firstname": "Test", "lastname": "Tutor"}',
    now(), now(), '', '', '', ''
  );

  -- Email sign-in needs a matching identity.
  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
  )
  values (
    gen_random_uuid(), v_tutor, v_tutor::text, 'email',
    jsonb_build_object('sub', v_tutor::text, 'email', 'tutor@example.test', 'email_verified', true),
    now(), now(), now()
  );

  -- Families ---------------------------------------------------------------------

  insert into public.families (tutor_id, name, contact_name, contact_email, contact_phone)
  values (v_tutor, 'Taylor', 'Sarah Taylor', 'sarah.taylor@example.test', '07700 900123')
  returning id into v_taylor;

  insert into public.families (tutor_id, name, contact_name, contact_email, contact_phone)
  values (v_tutor, 'Smith', 'Jo Smith', 'jo.smith@example.test', '07700 900234')
  returning id into v_smith;

  insert into public.families (tutor_id, name, contact_name, contact_email)
  values (v_tutor, 'Brown', 'Claire Brown', 'claire.brown@example.test')
  returning id into v_brown;

  insert into public.families (tutor_id, name, contact_name, contact_phone)
  values (v_tutor, 'Wilson', 'Mark Wilson', '+44 7700 900345')
  returning id into v_wilson;

  insert into public.families (tutor_id, name, contact_name, contact_email, contact_phone)
  values (v_tutor, 'Evans', 'Rachel Evans', 'rachel.evans@example.test', '07700 900456')
  returning id into v_evans;

  -- No contact details: the student form shows "No contact details".
  insert into public.families (tutor_id, name, contact_name)
  values (v_tutor, 'Thomas', 'Helen Thomas')
  returning id into v_thomas;

  insert into public.families (tutor_id, name, contact_name, contact_email, contact_phone)
  values (v_tutor, 'Hughes', 'Jo Hughes', 'jo.hughes@example.test', '07700 900567')
  returning id into v_hughes;

  insert into public.families (tutor_id, name, contact_name, contact_email, contact_phone)
  values (v_tutor, 'Johnson', 'Laura Johnson', 'laura.johnson@example.test', '(020) 7946 0958')
  returning id into v_johnson;

  insert into public.families (tutor_id, name, contact_name, contact_email)
  values (v_tutor, 'Roberts', 'Paul Roberts', 'paul.roberts@example.test')
  returning id into v_roberts;

  -- Children: first name only, always in a family ---------------------------------

  insert into public.students (tutor_id, type, first_name, family_id, subject, level, exam_board, notes)
  values
    (v_tutor, 'child', 'Emily', v_taylor, 'Maths', 'GCSE', 'AQA',
     'Confident with algebra; needs practice on simultaneous equations.'),
    (v_tutor, 'child', 'Oliver', v_taylor, 'English', 'Year 9', null, null),
    (v_tutor, 'child', 'Jack', v_smith, 'Science', 'GCSE', 'Edexcel', null),
    (v_tutor, 'child', 'Amelia', v_brown, 'Maths', '11+', null,
     'Sitting the 11+ in September. Timed papers on Saturdays.'),
    (v_tutor, 'child', 'Harry', v_brown, 'Maths', 'Year 6', null, null),
    (v_tutor, 'child', 'Sophie', v_wilson, 'Chemistry', 'A level', 'OCR', null),
    (v_tutor, 'child', 'Jacob', v_evans, 'Physics', 'GCSE', 'AQA', null),
    (v_tutor, 'child', 'Isla', v_evans, 'French', 'Year 10', null, null),
    (v_tutor, 'child', 'Noah', v_evans, 'Maths', 'Year 6', null, null),
    (v_tutor, 'child', 'Grace', v_thomas, 'English', 'GCSE', 'Edexcel', null),
    (v_tutor, 'child', 'Ruby', v_hughes, 'Spanish', 'GCSE', 'AQA', null),
    (v_tutor, 'child', 'Charlie', v_johnson, 'Maths', 'A level', 'Edexcel',
     -- A long note to exercise the 2,000-character counter.
     repeat('Worked through past papers on calculus and mechanics. ', 35)),
    (v_tutor, 'child', 'Mia', v_roberts, 'Science', 'Year 9', null, null),
    (v_tutor, 'child', 'George', v_smith, 'Maths', 'Year 10', null, null),
    (v_tutor, 'child', 'Freya', v_johnson, 'English', 'Year 6', null, null),
    (v_tutor, 'child', 'Alfie', v_roberts, 'Physics', 'A level', 'OCR', null),
    (v_tutor, 'child', 'Poppy', v_wilson, 'French', 'GCSE', 'AQA', null),
    (v_tutor, 'child', 'Leo', v_taylor, 'Science', 'Year 6', null, null),
    (v_tutor, 'child', 'Evie', v_hughes, 'Maths', '11+', null, null),
    (v_tutor, 'child', 'Arthur', v_thomas, 'Maths', 'Year 9', null, null);

  -- Adults: last name required, their own contact details --------------------------

  insert into public.students (
    tutor_id, type, first_name, last_name, family_id, subject, level, exam_board, notes, email, phone
  )
  values
    -- In a family alongside the children Ruby and Evie, with his own contact details.
    (v_tutor, 'adult', 'Daniel', 'Hughes', v_hughes, 'Maths', 'GCSE', 'AQA',
     'GCSE resit in November.', 'daniel.hughes@example.test', '+44 7700 900678'),
    (v_tutor, 'adult', 'Margaret', 'Clarke', null, 'French', 'A level', null,
     null, 'margaret.clarke@example.test', null),
    (v_tutor, 'adult', 'Tom', 'Walker', null, 'Spanish', 'GCSE', null,
     null, null, '07700 900789'),
    -- No contact details at all.
    (v_tutor, 'adult', 'Hannah', 'Wright', null, 'English', 'GCSE', null,
     null, null, null),
    (v_tutor, 'adult', 'James', 'Turner', null, 'Chemistry', 'A level', 'OCR',
     null, 'james.turner@example.test', '07700 900890');

  -- Tags ---------------------------------------------------------------------------

  insert into public.tags (tutor_id, name) values (v_tutor, 'Year 11') returning id into v_year_11;
  insert into public.tags (tutor_id, name) values (v_tutor, '11+') returning id into v_eleven_plus;
  insert into public.tags (tutor_id, name) values (v_tutor, 'Exam soon') returning id into v_exam_soon;
  insert into public.tags (tutor_id, name) values (v_tutor, 'Online') returning id into v_online;
  insert into public.tags (tutor_id, name) values (v_tutor, 'In person') returning id into v_in_person;
  -- Used by no one, to see an unused tag on the tags screen.
  insert into public.tags (tutor_id, name) values (v_tutor, 'Weekly');

  insert into public.student_tags (tutor_id, student_id, tag_id)
  select v_tutor, s.id, t.tag_id
  from (values
    ('Emily', v_year_11), ('Emily', v_exam_soon), ('Emily', v_online),
    ('Jack', v_year_11), ('Jack', v_in_person),
    ('Amelia', v_eleven_plus), ('Amelia', v_exam_soon),
    ('Evie', v_eleven_plus),
    ('Jacob', v_year_11), ('Jacob', v_online),
    ('Grace', v_year_11), ('Grace', v_exam_soon),
    ('Ruby', v_year_11), ('Ruby', v_in_person),
    ('Charlie', v_online),
    ('Poppy', v_year_11),
    ('Daniel', v_exam_soon), ('Daniel', v_online),
    ('Margaret', v_online),
    ('Tom', v_in_person)
  ) as t (first_name, tag_id)
  join public.students s on s.tutor_id = v_tutor and s.first_name = t.first_name;
end;
$$;
