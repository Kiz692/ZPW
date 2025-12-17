CREATE TABLE IF NOT EXISTS "org_position_assignment" (
	"pas_id" bigserial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_dependent" (
	"dep_id" bigserial PRIMARY KEY NOT NULL,
	"dep_tenant_id" bigint NOT NULL,
	"dep_emp_id" bigint NOT NULL,
	"dep_name" varchar(200),
	"dep_relationship_code" varchar(50) NOT NULL,
	"dep_date_of_birth" date,
	"dep_included_in_health_cover" boolean DEFAULT false NOT NULL,
	"dep_wellness_eligible" boolean DEFAULT false NOT NULL,
	"dep_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dep_created_by" bigint,
	"dep_updated_at" timestamp with time zone,
	"dep_updated_by" bigint,
	"dep_deleted_at" timestamp with time zone,
	"dep_deleted_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_emp_contract" (
	"ctr_id" bigserial PRIMARY KEY NOT NULL,
	"ctr_tenant_id" bigint NOT NULL,
	"ctr_emp_id" bigint NOT NULL,
	"ctr_contract_type_code" varchar(50) NOT NULL,
	"ctr_start_date" date NOT NULL,
	"ctr_end_date" date,
	"ctr_probation_end_date" date,
	"ctr_standard_hours_per_week" numeric(5, 2),
	"ctr_standard_days_per_week" numeric(3, 2),
	"ctr_status_code" varchar(50) NOT NULL,
	"ctr_prm_pas_id" bigint,
	"ctr_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ctr_created_by" bigint,
	"ctr_updated_at" timestamp with time zone,
	"ctr_updated_by" bigint,
	"ctr_deleted_at" timestamp with time zone,
	"ctr_deleted_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_emp_status_history" (
	"esh_id" bigserial PRIMARY KEY NOT NULL,
	"esh_tenant_id" bigint NOT NULL,
	"esh_emp_id" bigint NOT NULL,
	"esh_status_code" varchar(50) NOT NULL,
	"esh_effective_date" date NOT NULL,
	"esh_reason_code" varchar(50),
	"esh_reason_note" text,
	"esh_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"esh_created_by" bigint,
	"esh_updated_at" timestamp with time zone,
	"esh_updated_by" bigint,
	"esh_deleted_at" timestamp with time zone,
	"esh_deleted_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_employee" (
	"emp_id" bigserial PRIMARY KEY NOT NULL,
	"emp_tenant_id" bigint NOT NULL,
	"emp_per_id" bigint NOT NULL,
	"emp_employee_number" varchar(50) NOT NULL,
	"emp_hire_date" date,
	"emp_employment_type_code" varchar(50),
	"emp_current_status_code" varchar(50),
	"emp_current_status_effective_date" date,
	"emp_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"emp_created_by" bigint,
	"emp_updated_at" timestamp with time zone,
	"emp_updated_by" bigint,
	"emp_deleted_at" timestamp with time zone,
	"emp_deleted_by" bigint,
	CONSTRAINT "uq_emp_tenant_number" UNIQUE("emp_tenant_id","emp_employee_number"),
	CONSTRAINT "uq_emp_tenant_person" UNIQUE("emp_tenant_id","emp_per_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_employment_history" (
	"peh_id" bigserial PRIMARY KEY NOT NULL,
	"peh_per_id" bigint NOT NULL,
	"peh_employer_name" varchar(255) NOT NULL,
	"peh_role_title" varchar(255),
	"peh_start_date" date,
	"peh_end_date" date,
	"peh_summary" text,
	"peh_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"peh_created_by" bigint,
	"peh_updated_at" timestamp with time zone,
	"peh_updated_by" bigint,
	"peh_deleted_at" timestamp with time zone,
	"peh_deleted_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_person" (
	"per_id" bigserial PRIMARY KEY NOT NULL,
	"per_first_name" varchar(100) NOT NULL,
	"per_middle_name" varchar(100),
	"per_last_name" varchar(150) NOT NULL,
	"per_display_name" varchar(255),
	"per_gender_code" varchar(50),
	"per_date_of_birth" date,
	"per_nationality_code" varchar(10),
	"per_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"per_created_by" bigint,
	"per_updated_at" timestamp with time zone,
	"per_updated_by" bigint,
	"per_deleted_at" timestamp with time zone,
	"per_deleted_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_person_contact" (
	"pco_id" bigserial PRIMARY KEY NOT NULL,
	"pco_per_id" bigint NOT NULL,
	"pco_contact_type_code" varchar(50) NOT NULL,
	"pco_contact_value" varchar(255) NOT NULL,
	"pco_is_primary" boolean DEFAULT false NOT NULL,
	"pco_label" varchar(50),
	"pco_country_code" varchar(10),
	"pco_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pco_created_by" bigint,
	"pco_updated_at" timestamp with time zone,
	"pco_updated_by" bigint,
	"pco_deleted_at" timestamp with time zone,
	"pco_deleted_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_person_identifier" (
	"idn_id" bigserial PRIMARY KEY NOT NULL,
	"idn_per_id" bigint NOT NULL,
	"idn_identifier_type_code" varchar(50) NOT NULL,
	"idn_identifier_value" varchar(100) NOT NULL,
	"idn_country_code" varchar(10),
	"idn_valid_from" date,
	"idn_valid_to" date,
	"idn_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"idn_created_by" bigint,
	"idn_updated_at" timestamp with time zone,
	"idn_updated_by" bigint,
	"idn_deleted_at" timestamp with time zone,
	"idn_deleted_by" bigint,
	CONSTRAINT "uq_idn_type_country_value" UNIQUE("idn_identifier_type_code","idn_country_code","idn_identifier_value")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_qualification" (
	"qlf_id" bigserial PRIMARY KEY NOT NULL,
	"qlf_per_id" bigint NOT NULL,
	"qlf_qualification_type_code" varchar(50) NOT NULL,
	"qlf_institution" varchar(255),
	"qlf_qualification_name" varchar(255) NOT NULL,
	"qlf_level_code" varchar(50),
	"qlf_completion_year" integer,
	"qlf_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"qlf_created_by" bigint,
	"qlf_updated_at" timestamp with time zone,
	"qlf_updated_by" bigint,
	"qlf_deleted_at" timestamp with time zone,
	"qlf_deleted_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_wellness_profile" (
	"wep_id" bigserial PRIMARY KEY NOT NULL,
	"wep_tenant_id" bigint NOT NULL,
	"wep_emp_id" bigint NOT NULL,
	"wep_consent_flag" boolean DEFAULT false NOT NULL,
	"wep_preferred_channel_code" varchar(50),
	"wep_last_zhep_sync_at" timestamp with time zone,
	"wep_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"wep_created_by" bigint,
	"wep_updated_at" timestamp with time zone,
	"wep_updated_by" bigint,
	"wep_deleted_at" timestamp with time zone,
	"wep_deleted_by" bigint,
	CONSTRAINT "uq_wep_emp_id" UNIQUE("wep_emp_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pid_wellness_profile_tag" (
	"wpt_id" bigserial PRIMARY KEY NOT NULL,
	"wpt_tenant_id" bigint NOT NULL,
	"wpt_wep_id" bigint NOT NULL,
	"wpt_tag_code" varchar(100) NOT NULL,
	"wpt_source_system" varchar(50) NOT NULL,
	"wpt_first_seen_at" timestamp with time zone NOT NULL,
	"wpt_last_updated_at" timestamp with time zone NOT NULL,
	"wpt_is_active" boolean DEFAULT true NOT NULL,
	"wpt_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"wpt_created_by" bigint,
	"wpt_updated_at" timestamp with time zone,
	"wpt_updated_by" bigint,
	"wpt_deleted_at" timestamp with time zone,
	"wpt_deleted_by" bigint,
	CONSTRAINT "uq_wpt_profile_tag" UNIQUE("wpt_tenant_id","wpt_wep_id","wpt_tag_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_tenant" (
	"ten_id" bigserial PRIMARY KEY NOT NULL,
	"ten_name" varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dep_tenant_emp" ON "pid_dependent" ("dep_tenant_id","dep_emp_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ctr_tenant_id" ON "pid_emp_contract" ("ctr_tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ctr_emp_id" ON "pid_emp_contract" ("ctr_emp_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ctr_prm_pas_id" ON "pid_emp_contract" ("ctr_prm_pas_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ctr_tenant_emp_status" ON "pid_emp_contract" ("ctr_tenant_id","ctr_emp_id","ctr_status_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_esh_tenant_id" ON "pid_emp_status_history" ("esh_tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_esh_tenant_emp_date" ON "pid_emp_status_history" ("esh_tenant_id","esh_emp_id","esh_effective_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_emp_tenant_id" ON "pid_employee" ("emp_tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_peh_per_id" ON "pid_employment_history" ("peh_per_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_per_last_first" ON "pid_person" ("per_last_name","per_first_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_per_display_name" ON "pid_person" ("per_display_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pco_per_id" ON "pid_person_contact" ("pco_per_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pco_person_type_primary" ON "pid_person_contact" ("pco_per_id","pco_contact_type_code","pco_is_primary");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_idn_per_id" ON "pid_person_identifier" ("idn_per_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qlf_per_id" ON "pid_qualification" ("qlf_per_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_wep_tenant_id" ON "pid_wellness_profile" ("wep_tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_wpt_tenant_id" ON "pid_wellness_profile_tag" ("wpt_tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_wpt_wep_id" ON "pid_wellness_profile_tag" ("wpt_wep_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_dependent" ADD CONSTRAINT "pid_dependent_dep_tenant_id_sys_tenant_ten_id_fk" FOREIGN KEY ("dep_tenant_id") REFERENCES "sys_tenant"("ten_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_dependent" ADD CONSTRAINT "pid_dependent_dep_emp_id_pid_employee_emp_id_fk" FOREIGN KEY ("dep_emp_id") REFERENCES "pid_employee"("emp_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_emp_contract" ADD CONSTRAINT "pid_emp_contract_ctr_tenant_id_sys_tenant_ten_id_fk" FOREIGN KEY ("ctr_tenant_id") REFERENCES "sys_tenant"("ten_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_emp_contract" ADD CONSTRAINT "pid_emp_contract_ctr_emp_id_pid_employee_emp_id_fk" FOREIGN KEY ("ctr_emp_id") REFERENCES "pid_employee"("emp_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_emp_contract" ADD CONSTRAINT "pid_emp_contract_ctr_prm_pas_id_org_position_assignment_pas_id_fk" FOREIGN KEY ("ctr_prm_pas_id") REFERENCES "org_position_assignment"("pas_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_emp_status_history" ADD CONSTRAINT "pid_emp_status_history_esh_tenant_id_sys_tenant_ten_id_fk" FOREIGN KEY ("esh_tenant_id") REFERENCES "sys_tenant"("ten_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_emp_status_history" ADD CONSTRAINT "pid_emp_status_history_esh_emp_id_pid_employee_emp_id_fk" FOREIGN KEY ("esh_emp_id") REFERENCES "pid_employee"("emp_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_employee" ADD CONSTRAINT "pid_employee_emp_tenant_id_sys_tenant_ten_id_fk" FOREIGN KEY ("emp_tenant_id") REFERENCES "sys_tenant"("ten_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_employee" ADD CONSTRAINT "pid_employee_emp_per_id_pid_person_per_id_fk" FOREIGN KEY ("emp_per_id") REFERENCES "pid_person"("per_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_employment_history" ADD CONSTRAINT "pid_employment_history_peh_per_id_pid_person_per_id_fk" FOREIGN KEY ("peh_per_id") REFERENCES "pid_person"("per_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_person_contact" ADD CONSTRAINT "pid_person_contact_pco_per_id_pid_person_per_id_fk" FOREIGN KEY ("pco_per_id") REFERENCES "pid_person"("per_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_person_identifier" ADD CONSTRAINT "pid_person_identifier_idn_per_id_pid_person_per_id_fk" FOREIGN KEY ("idn_per_id") REFERENCES "pid_person"("per_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_qualification" ADD CONSTRAINT "pid_qualification_qlf_per_id_pid_person_per_id_fk" FOREIGN KEY ("qlf_per_id") REFERENCES "pid_person"("per_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_wellness_profile" ADD CONSTRAINT "pid_wellness_profile_wep_tenant_id_sys_tenant_ten_id_fk" FOREIGN KEY ("wep_tenant_id") REFERENCES "sys_tenant"("ten_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_wellness_profile" ADD CONSTRAINT "pid_wellness_profile_wep_emp_id_pid_employee_emp_id_fk" FOREIGN KEY ("wep_emp_id") REFERENCES "pid_employee"("emp_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_wellness_profile_tag" ADD CONSTRAINT "pid_wellness_profile_tag_wpt_tenant_id_sys_tenant_ten_id_fk" FOREIGN KEY ("wpt_tenant_id") REFERENCES "sys_tenant"("ten_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pid_wellness_profile_tag" ADD CONSTRAINT "pid_wellness_profile_tag_wpt_wep_id_pid_wellness_profile_wep_id_fk" FOREIGN KEY ("wpt_wep_id") REFERENCES "pid_wellness_profile"("wep_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
