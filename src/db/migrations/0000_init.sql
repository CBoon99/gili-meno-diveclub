CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"divers" integer NOT NULL,
	"course" text NOT NULL,
	"preferred_date" text NOT NULL,
	"certification" text,
	"notes" text,
	"consent" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'api' NOT NULL,
	"netlify_submission_id" text,
	CONSTRAINT "bookings_netlify_submission_id_unique" UNIQUE("netlify_submission_id")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"source" text DEFAULT 'api' NOT NULL,
	"netlify_submission_id" text,
	CONSTRAINT "contacts_netlify_submission_id_unique" UNIQUE("netlify_submission_id")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'api' NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
