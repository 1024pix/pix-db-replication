PGDMP     ,    2            	    x            replication_source    12.4    12.4 �              0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16385    replication_source    DATABASE     �   CREATE DATABASE replication_source WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';
 "   DROP DATABASE replication_source;
                postgres    false            �            1259    16430    answers    TABLE     �  CREATE TABLE public.answers (
    id integer NOT NULL,
    value text,
    result character varying(255),
    "assessmentId" integer,
    "challengeId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    timeout integer,
    "elapsedTime" integer,
    "resultDetails" text
);
    DROP TABLE public.answers;
       public         heap    postgres    false            �            1259    16428    answers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.answers_id_seq;
       public          postgres    false    213                       0    0    answers_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.answers_id_seq OWNED BY public.answers.id;
          public          postgres    false    212            �            1259    16683    assessment-results    TABLE     �  CREATE TABLE public."assessment-results" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    level integer,
    "pixScore" integer,
    emitter text NOT NULL,
    "commentForJury" text,
    "commentForOrganization" text,
    "commentForCandidate" text,
    status text NOT NULL,
    "juryId" integer,
    "assessmentId" integer
);
 (   DROP TABLE public."assessment-results";
       public         heap    postgres    false            �            1259    16681    assessment-results_id_seq    SEQUENCE     �   CREATE SEQUENCE public."assessment-results_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."assessment-results_id_seq";
       public          postgres    false    231                       0    0    assessment-results_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."assessment-results_id_seq" OWNED BY public."assessment-results".id;
          public          postgres    false    230            �            1259    16417    assessments    TABLE     �  CREATE TABLE public.assessments (
    id integer NOT NULL,
    "courseId" character varying(255),
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer,
    type character varying(255),
    state text,
    "competenceId" character varying(255),
    "isImproving" boolean DEFAULT false,
    "campaignParticipationId" integer,
    "certificationCourseId" integer
);
    DROP TABLE public.assessments;
       public         heap    postgres    false            �            1259    16415    assessments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.assessments_id_seq;
       public          postgres    false    211                       0    0    assessments_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;
          public          postgres    false    210            	           1259    17280    badge-acquisitions    TABLE     �   CREATE TABLE public."badge-acquisitions" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer NOT NULL,
    "badgeId" integer NOT NULL
);
 (   DROP TABLE public."badge-acquisitions";
       public         heap    postgres    false                       1259    17278    badge-acquisitions_id_seq    SEQUENCE     �   CREATE SEQUENCE public."badge-acquisitions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."badge-acquisitions_id_seq";
       public          postgres    false    265                       0    0    badge-acquisitions_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."badge-acquisitions_id_seq" OWNED BY public."badge-acquisitions".id;
          public          postgres    false    264                       1259    17375    badge-criteria    TABLE     �   CREATE TABLE public."badge-criteria" (
    id integer NOT NULL,
    scope character varying(255) NOT NULL,
    threshold integer NOT NULL,
    "badgeId" integer
);
 $   DROP TABLE public."badge-criteria";
       public         heap    postgres    false                       1259    17373    badge-criteria_id_seq    SEQUENCE     �   CREATE SEQUENCE public."badge-criteria_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."badge-criteria_id_seq";
       public          postgres    false    274                       0    0    badge-criteria_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."badge-criteria_id_seq" OWNED BY public."badge-criteria".id;
          public          postgres    false    273                       1259    17305    badge-partner-competences    TABLE     �   CREATE TABLE public."badge-partner-competences" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "skillIds" text[] NOT NULL,
    color character varying(255),
    "badgeId" integer
);
 /   DROP TABLE public."badge-partner-competences";
       public         heap    postgres    false            
           1259    17303     badge-partner-competences_id_seq    SEQUENCE     �   CREATE SEQUENCE public."badge-partner-competences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE public."badge-partner-competences_id_seq";
       public          postgres    false    267                       0    0     badge-partner-competences_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE public."badge-partner-competences_id_seq" OWNED BY public."badge-partner-competences".id;
          public          postgres    false    266                       1259    17236    badges    TABLE       CREATE TABLE public.badges (
    id integer NOT NULL,
    "altMessage" character varying(255) NOT NULL,
    "imageUrl" character varying(255) NOT NULL,
    message character varying(255) NOT NULL,
    "targetProfileId" integer,
    key text,
    title character varying(255)
);
    DROP TABLE public.badges;
       public         heap    postgres    false                       1259    17234    badges_id_seq    SEQUENCE     �   CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.badges_id_seq;
       public          postgres    false    261                       0    0    badges_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;
          public          postgres    false    260            �            1259    16809    campaign-participations    TABLE     T  CREATE TABLE public."campaign-participations" (
    id integer NOT NULL,
    "campaignId" integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isShared" boolean DEFAULT false NOT NULL,
    "sharedAt" timestamp with time zone,
    "userId" integer,
    "participantExternalId" character varying(255)
);
 -   DROP TABLE public."campaign-participations";
       public         heap    postgres    false            �            1259    16807    campaign-participations_id_seq    SEQUENCE     �   CREATE SEQUENCE public."campaign-participations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public."campaign-participations_id_seq";
       public          postgres    false    241                       0    0    campaign-participations_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public."campaign-participations_id_seq" OWNED BY public."campaign-participations".id;
          public          postgres    false    240            �            1259    16759 	   campaigns    TABLE     �  CREATE TABLE public.campaigns (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) DEFAULT ''::character varying NOT NULL,
    "organizationId" integer NOT NULL,
    "creatorId" integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "targetProfileId" integer,
    "idPixLabel" character varying(255),
    title character varying(255),
    "customLandingPageText" text,
    "archivedAt" timestamp with time zone,
    type character varying(255) DEFAULT ''::character varying NOT NULL,
    "externalIdHelpImageUrl" text,
    "alternativeTextToExternalIdHelpImage" text
);
    DROP TABLE public.campaigns;
       public         heap    postgres    false            �            1259    16757    campaigns_id_seq    SEQUENCE     �   CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.campaigns_id_seq;
       public          postgres    false    237                       0    0    campaigns_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;
          public          postgres    false    236            �            1259    16977    certification-candidates    TABLE     �  CREATE TABLE public."certification-candidates" (
    id integer NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    "birthCity" character varying(255) NOT NULL,
    "externalId" character varying(255),
    birthdate date NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sessionId" integer NOT NULL,
    "extraTimePercentage" numeric(3,2),
    "birthProvinceCode" character varying(255),
    "birthCountry" character varying(255),
    "userId" integer,
    email character varying(255),
    "resultRecipientEmail" character varying(500)
);
 .   DROP TABLE public."certification-candidates";
       public         heap    postgres    false            �            1259    16975    certification-candidates_id_seq    SEQUENCE     �   CREATE SEQUENCE public."certification-candidates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public."certification-candidates_id_seq";
       public          postgres    false    255                       0    0    certification-candidates_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public."certification-candidates_id_seq" OWNED BY public."certification-candidates".id;
          public          postgres    false    254            �            1259    16909     certification-center-memberships    TABLE     �   CREATE TABLE public."certification-center-memberships" (
    id integer NOT NULL,
    "userId" integer,
    "certificationCenterId" integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 6   DROP TABLE public."certification-center-memberships";
       public         heap    postgres    false            �            1259    16907 '   certification-center-memberships_id_seq    SEQUENCE     �   CREATE SEQUENCE public."certification-center-memberships_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 @   DROP SEQUENCE public."certification-center-memberships_id_seq";
       public          postgres    false    251                        0    0 '   certification-center-memberships_id_seq    SEQUENCE OWNED BY     w   ALTER SEQUENCE public."certification-center-memberships_id_seq" OWNED BY public."certification-center-memberships".id;
          public          postgres    false    250            �            1259    16898    certification-centers    TABLE     o  CREATE TABLE public."certification-centers" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "externalId" character varying(255),
    type text,
    CONSTRAINT "certification-centers_type_check" CHECK ((type = ANY (ARRAY['SCO'::text, 'SUP'::text, 'PRO'::text])))
);
 +   DROP TABLE public."certification-centers";
       public         heap    postgres    false            �            1259    16896    certification-centers_id_seq    SEQUENCE     �   CREATE SEQUENCE public."certification-centers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public."certification-centers_id_seq";
       public          postgres    false    249            !           0    0    certification-centers_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public."certification-centers_id_seq" OWNED BY public."certification-centers".id;
          public          postgres    false    248            �            1259    16588    certification-challenges    TABLE     �  CREATE TABLE public."certification-challenges" (
    id integer NOT NULL,
    "challengeId" character varying(255),
    "competenceId" character varying(255),
    "associatedSkillName" character varying(255),
    "courseId" integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "associatedSkillId" character varying(255)
);
 .   DROP TABLE public."certification-challenges";
       public         heap    postgres    false            �            1259    16586    certification-challenges_id_seq    SEQUENCE     �   CREATE SEQUENCE public."certification-challenges_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public."certification-challenges_id_seq";
       public          postgres    false    223            "           0    0    certification-challenges_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public."certification-challenges_id_seq" OWNED BY public."certification-challenges".id;
          public          postgres    false    222            �            1259    16578    certification-courses    TABLE     �  CREATE TABLE public."certification-courses" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer,
    "completedAt" timestamp with time zone,
    "firstName" character varying(255),
    "lastName" character varying(255),
    birthdate date,
    birthplace character varying(255),
    "sessionId" integer,
    "externalId" character varying(255),
    "isPublished" boolean DEFAULT false NOT NULL,
    "isV2Certification" boolean DEFAULT false NOT NULL,
    "examinerComment" character varying(500),
    "hasSeenEndTestScreen" boolean DEFAULT false,
    "verificationCode" character varying(255)
);
 +   DROP TABLE public."certification-courses";
       public         heap    postgres    false            �            1259    16576    certification-courses_id_seq    SEQUENCE     �   CREATE SEQUENCE public."certification-courses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public."certification-courses_id_seq";
       public          postgres    false    221            #           0    0    certification-courses_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public."certification-courses_id_seq" OWNED BY public."certification-courses".id;
          public          postgres    false    220            �            1259    16946    competence-evaluations    TABLE     d  CREATE TABLE public."competence-evaluations" (
    id integer NOT NULL,
    "assessmentId" integer,
    "userId" integer,
    "competenceId" character varying(255),
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status character varying(255)
);
 ,   DROP TABLE public."competence-evaluations";
       public         heap    postgres    false            �            1259    16944    competence-evaluations_id_seq    SEQUENCE     �   CREATE SEQUENCE public."competence-evaluations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public."competence-evaluations_id_seq";
       public          postgres    false    253            $           0    0    competence-evaluations_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public."competence-evaluations_id_seq" OWNED BY public."competence-evaluations".id;
          public          postgres    false    252            �            1259    16712    competence-marks    TABLE     D  CREATE TABLE public."competence-marks" (
    id integer NOT NULL,
    level integer,
    score integer,
    area_code text NOT NULL,
    competence_code text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assessmentResultId" integer,
    "competenceId" character varying(255)
);
 &   DROP TABLE public."competence-marks";
       public         heap    postgres    false            �            1259    16710    competence-marks_id_seq    SEQUENCE     �   CREATE SEQUENCE public."competence-marks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."competence-marks_id_seq";
       public          postgres    false    233            %           0    0    competence-marks_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."competence-marks_id_seq" OWNED BY public."competence-marks".id;
          public          postgres    false    232            �            1259    16473 	   feedbacks    TABLE     u  CREATE TABLE public.feedbacks (
    id integer NOT NULL,
    content text NOT NULL,
    "assessmentId" integer,
    "challengeId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category character varying(255),
    answer text
);
    DROP TABLE public.feedbacks;
       public         heap    postgres    false            �            1259    16471    feedbacks_id_seq    SEQUENCE     �   CREATE SEQUENCE public.feedbacks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.feedbacks_id_seq;
       public          postgres    false    215            &           0    0    feedbacks_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.feedbacks_id_seq OWNED BY public.feedbacks.id;
          public          postgres    false    214            �            1259    16388    knex_migrations    TABLE     �   CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);
 #   DROP TABLE public.knex_migrations;
       public         heap    postgres    false            �            1259    16386    knex_migrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.knex_migrations_id_seq;
       public          postgres    false    205            '           0    0    knex_migrations_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;
          public          postgres    false    204            �            1259    16396    knex_migrations_lock    TABLE     `   CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);
 (   DROP TABLE public.knex_migrations_lock;
       public         heap    postgres    false            �            1259    16394    knex_migrations_lock_index_seq    SEQUENCE     �   CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.knex_migrations_lock_index_seq;
       public          postgres    false    207            (           0    0    knex_migrations_lock_index_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;
          public          postgres    false    206                       1259    17406    knowledge-element-snapshots    TABLE     �   CREATE TABLE public."knowledge-element-snapshots" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "snappedAt" timestamp with time zone NOT NULL,
    snapshot jsonb NOT NULL
);
 1   DROP TABLE public."knowledge-element-snapshots";
       public         heap    postgres    false                       1259    17404 "   knowledge-element-snapshots_id_seq    SEQUENCE     �   CREATE SEQUENCE public."knowledge-element-snapshots_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public."knowledge-element-snapshots_id_seq";
       public          postgres    false    276            )           0    0 "   knowledge-element-snapshots_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public."knowledge-element-snapshots_id_seq" OWNED BY public."knowledge-element-snapshots".id;
          public          postgres    false    275            �            1259    16784    knowledge-elements    TABLE     �  CREATE TABLE public."knowledge-elements" (
    id integer NOT NULL,
    source character varying(255),
    status character varying(255),
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "answerId" integer,
    "assessmentId" integer,
    "skillId" character varying(255),
    "earnedPix" real DEFAULT '0'::real NOT NULL,
    "userId" integer,
    "competenceId" character varying(255)
);
 (   DROP TABLE public."knowledge-elements";
       public         heap    postgres    false            �            1259    16782    knowledge-elements_id_seq    SEQUENCE     �   CREATE SEQUENCE public."knowledge-elements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."knowledge-elements_id_seq";
       public          postgres    false    239            *           0    0    knowledge-elements_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."knowledge-elements_id_seq" OWNED BY public."knowledge-elements".id;
          public          postgres    false    238            �            1259    16739    memberships    TABLE     J  CREATE TABLE public.memberships (
    id integer NOT NULL,
    "userId" integer,
    "organizationId" integer,
    "organizationRole" character varying(255) DEFAULT 'MEMBER'::character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" timestamp with time zone,
    "updatedByUserId" integer,
    CONSTRAINT "memberships_organizationRole_check" CHECK ((("organizationRole")::text = ANY ((ARRAY['ADMIN'::character varying, 'MEMBER'::character varying])::text[])))
);
    DROP TABLE public.memberships;
       public         heap    postgres    false                       1259    17189    organization-invitations    TABLE       CREATE TABLE public."organization-invitations" (
    id integer NOT NULL,
    "organizationId" integer,
    email character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    code character varying(255) NOT NULL,
    role text,
    CONSTRAINT "organization-invitations_role_check" CHECK ((role = ANY (ARRAY['MEMBER'::text, 'ADMIN'::text])))
);
 .   DROP TABLE public."organization-invitations";
       public         heap    postgres    false                       1259    17187    organization-invitations_id_seq    SEQUENCE     �   CREATE SEQUENCE public."organization-invitations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public."organization-invitations_id_seq";
       public          postgres    false    259            +           0    0    organization-invitations_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public."organization-invitations_id_seq" OWNED BY public."organization-invitations".id;
          public          postgres    false    258                       1259    17462    organization-tags    TABLE       CREATE TABLE public."organization-tags" (
    id integer NOT NULL,
    "organizationId" integer,
    "tagId" integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 '   DROP TABLE public."organization-tags";
       public         heap    postgres    false                       1259    17460    organization-tags_id_seq    SEQUENCE     �   CREATE SEQUENCE public."organization-tags_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public."organization-tags_id_seq";
       public          postgres    false    282            ,           0    0    organization-tags_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public."organization-tags_id_seq" OWNED BY public."organization-tags".id;
          public          postgres    false    281            �            1259    16499    organizations    TABLE     �  CREATE TABLE public.organizations (
    id integer NOT NULL,
    type text NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "logoUrl" text,
    "externalId" character varying(255),
    "isManagingStudents" boolean DEFAULT false,
    "provinceCode" character varying(255),
    credit integer DEFAULT 0,
    "canCollectProfiles" boolean DEFAULT false NOT NULL,
    email character varying(255),
    CONSTRAINT organizations_type_check CHECK ((type = ANY (ARRAY['SCO'::text, 'SUP'::text, 'PRO'::text])))
);
 !   DROP TABLE public.organizations;
       public         heap    postgres    false            �            1259    16737    organizations-accesses_id_seq    SEQUENCE     �   CREATE SEQUENCE public."organizations-accesses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public."organizations-accesses_id_seq";
       public          postgres    false    235            -           0    0    organizations-accesses_id_seq    SEQUENCE OWNED BY     V   ALTER SEQUENCE public."organizations-accesses_id_seq" OWNED BY public.memberships.id;
          public          postgres    false    234            �            1259    16497    organizations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.organizations_id_seq;
       public          postgres    false    217            .           0    0    organizations_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;
          public          postgres    false    216                       1259    17339    partner-certifications    TABLE     �   CREATE TABLE public."partner-certifications" (
    "certificationCourseId" integer NOT NULL,
    "partnerKey" character varying(255) NOT NULL,
    acquired boolean NOT NULL
);
 ,   DROP TABLE public."partner-certifications";
       public         heap    postgres    false            �            1259    16644 	   pix_roles    TABLE     \   CREATE TABLE public.pix_roles (
    id integer NOT NULL,
    name character varying(255)
);
    DROP TABLE public.pix_roles;
       public         heap    postgres    false            �            1259    16642    pix_roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.pix_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.pix_roles_id_seq;
       public          postgres    false    227            /           0    0    pix_roles_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.pix_roles_id_seq OWNED BY public.pix_roles.id;
          public          postgres    false    226            �            1259    16543    reset-password-demands    TABLE     Q  CREATE TABLE public."reset-password-demands" (
    id integer NOT NULL,
    email character varying(255),
    "temporaryKey" character varying(255),
    used boolean DEFAULT false,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 ,   DROP TABLE public."reset-password-demands";
       public         heap    postgres    false            �            1259    16541    reset-password-demands_id_seq    SEQUENCE     �   CREATE SEQUENCE public."reset-password-demands_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public."reset-password-demands_id_seq";
       public          postgres    false    219            0           0    0    reset-password-demands_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public."reset-password-demands_id_seq" OWNED BY public."reset-password-demands".id;
          public          postgres    false    218                       1259    16999    schooling-registrations    TABLE     |  CREATE TABLE public."schooling-registrations" (
    id integer NOT NULL,
    "userId" integer,
    "organizationId" integer NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    birthdate date NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "preferredLastName" character varying(255),
    "middleName" character varying(255),
    "thirdName" character varying(255),
    "birthCity" character varying(255),
    "birthCityCode" character varying(255),
    "birthProvinceCode" character varying(255),
    "birthCountryCode" character varying(255),
    "MEFCode" character varying(255),
    status character varying(255),
    "nationalStudentId" character varying(255),
    division character varying(255),
    email character varying(255),
    "studentNumber" character varying(255),
    department character varying(255),
    "educationalTeam" character varying(255),
    "group" character varying(255),
    diploma character varying(255),
    "isSupernumerary" boolean
);
 -   DROP TABLE public."schooling-registrations";
       public         heap    postgres    false            �            1259    16628    sessions    TABLE     �  CREATE TABLE public.sessions (
    id integer NOT NULL,
    "certificationCenter" text NOT NULL,
    address text NOT NULL,
    room text NOT NULL,
    examiner text NOT NULL,
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    description text DEFAULT ''::text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "accessCode" character varying(255),
    "certificationCenterId" integer,
    "examinerGlobalComment" character varying(500),
    "finalizedAt" timestamp with time zone,
    "resultsSentToPrescriberAt" timestamp with time zone,
    "publishedAt" timestamp with time zone,
    "assignedCertificationOfficerId" integer
);
    DROP TABLE public.sessions;
       public         heap    postgres    false            �            1259    16626    sessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.sessions_id_seq;
       public          postgres    false    225            1           0    0    sessions_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;
          public          postgres    false    224                       1259    17424    stages    TABLE     r  CREATE TABLE public.stages (
    id integer NOT NULL,
    "targetProfileId" integer NOT NULL,
    title character varying(255) NOT NULL,
    message character varying(255) NOT NULL,
    threshold integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.stages;
       public         heap    postgres    false                       1259    17422    stages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.stages_id_seq;
       public          postgres    false    278            2           0    0    stages_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.stages_id_seq OWNED BY public.stages.id;
          public          postgres    false    277                        1259    16997    students_id_seq    SEQUENCE     �   CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.students_id_seq;
       public          postgres    false    257            3           0    0    students_id_seq    SEQUENCE OWNED BY     T   ALTER SEQUENCE public.students_id_seq OWNED BY public."schooling-registrations".id;
          public          postgres    false    256                       1259    17450    tags    TABLE     �   CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.tags;
       public         heap    postgres    false                       1259    17448    tags_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.tags_id_seq;
       public          postgres    false    280            4           0    0    tags_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;
          public          postgres    false    279            �            1259    16873    target-profile-shares    TABLE     �   CREATE TABLE public."target-profile-shares" (
    id integer NOT NULL,
    "targetProfileId" integer,
    "organizationId" integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 +   DROP TABLE public."target-profile-shares";
       public         heap    postgres    false            �            1259    16871    target-profile-shares_id_seq    SEQUENCE     �   CREATE SEQUENCE public."target-profile-shares_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public."target-profile-shares_id_seq";
       public          postgres    false    247            5           0    0    target-profile-shares_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public."target-profile-shares_id_seq" OWNED BY public."target-profile-shares".id;
          public          postgres    false    246            �            1259    16830    target-profiles    TABLE     {  CREATE TABLE public."target-profiles" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "organizationId" integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    outdated boolean DEFAULT false NOT NULL,
    "imageUrl" character varying(255) DEFAULT NULL::character varying
);
 %   DROP TABLE public."target-profiles";
       public         heap    postgres    false            �            1259    16828    target-profiles_id_seq    SEQUENCE     �   CREATE SEQUENCE public."target-profiles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public."target-profiles_id_seq";
       public          postgres    false    243            6           0    0    target-profiles_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public."target-profiles_id_seq" OWNED BY public."target-profiles".id;
          public          postgres    false    242            �            1259    16846    target-profiles_skills    TABLE     �   CREATE TABLE public."target-profiles_skills" (
    id integer NOT NULL,
    "targetProfileId" integer,
    "skillId" character varying(255) NOT NULL
);
 ,   DROP TABLE public."target-profiles_skills";
       public         heap    postgres    false            �            1259    16844    target-profiles_skills_id_seq    SEQUENCE     �   CREATE SEQUENCE public."target-profiles_skills_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public."target-profiles_skills_id_seq";
       public          postgres    false    245            7           0    0    target-profiles_skills_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public."target-profiles_skills_id_seq" OWNED BY public."target-profiles_skills".id;
          public          postgres    false    244                       1259    17360    tutorial-evaluations    TABLE     2  CREATE TABLE public."tutorial-evaluations" (
    id integer NOT NULL,
    "userId" bigint NOT NULL,
    "tutorialId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 *   DROP TABLE public."tutorial-evaluations";
       public         heap    postgres    false                       1259    17358    tutorial-evaluations_id_seq    SEQUENCE     �   CREATE SEQUENCE public."tutorial-evaluations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public."tutorial-evaluations_id_seq";
       public          postgres    false    272            8           0    0    tutorial-evaluations_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public."tutorial-evaluations_id_seq" OWNED BY public."tutorial-evaluations".id;
          public          postgres    false    271                       1259    17253    user-orga-settings    TABLE       CREATE TABLE public."user-orga-settings" (
    id integer NOT NULL,
    "userId" bigint,
    "currentOrganizationId" bigint,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 (   DROP TABLE public."user-orga-settings";
       public         heap    postgres    false                       1259    17251    user-orga-settings_id_seq    SEQUENCE     �   CREATE SEQUENCE public."user-orga-settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."user-orga-settings_id_seq";
       public          postgres    false    263            9           0    0    user-orga-settings_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."user-orga-settings_id_seq" OWNED BY public."user-orga-settings".id;
          public          postgres    false    262                       1259    17327    user_tutorials    TABLE     !  CREATE TABLE public.user_tutorials (
    id integer NOT NULL,
    "userId" bigint,
    "tutorialId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 "   DROP TABLE public.user_tutorials;
       public         heap    postgres    false                       1259    17325    user_tutorials_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_tutorials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.user_tutorials_id_seq;
       public          postgres    false    269            :           0    0    user_tutorials_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.user_tutorials_id_seq OWNED BY public.user_tutorials.id;
          public          postgres    false    268            �            1259    16404    users    TABLE     J  CREATE TABLE public.users (
    id integer NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    email character varying(255),
    password character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cgu boolean,
    "pixOrgaTermsOfServiceAccepted" boolean DEFAULT false,
    "samlId" character varying(255),
    "pixCertifTermsOfServiceAccepted" boolean DEFAULT false,
    "hasSeenAssessmentInstructions" boolean DEFAULT false,
    username character varying(255),
    "shouldChangePassword" boolean DEFAULT false NOT NULL,
    "mustValidateTermsOfService" boolean DEFAULT false NOT NULL,
    "lastTermsOfServiceValidatedAt" timestamp with time zone
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    16402    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    209            ;           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    208            �            1259    16652    users_pix_roles    TABLE     o   CREATE TABLE public.users_pix_roles (
    id integer NOT NULL,
    user_id integer,
    pix_role_id integer
);
 #   DROP TABLE public.users_pix_roles;
       public         heap    postgres    false            �            1259    16650    users_pix_roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_pix_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.users_pix_roles_id_seq;
       public          postgres    false    229            <           0    0    users_pix_roles_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.users_pix_roles_id_seq OWNED BY public.users_pix_roles.id;
          public          postgres    false    228                       2604    16433 
   answers id    DEFAULT     h   ALTER TABLE ONLY public.answers ALTER COLUMN id SET DEFAULT nextval('public.answers_id_seq'::regclass);
 9   ALTER TABLE public.answers ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    212    213    213            6           2604    16686    assessment-results id    DEFAULT     �   ALTER TABLE ONLY public."assessment-results" ALTER COLUMN id SET DEFAULT nextval('public."assessment-results_id_seq"'::regclass);
 F   ALTER TABLE public."assessment-results" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    230    231    231                       2604    16420    assessments id    DEFAULT     p   ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);
 =   ALTER TABLE public.assessments ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    211    210    211            f           2604    17283    badge-acquisitions id    DEFAULT     �   ALTER TABLE ONLY public."badge-acquisitions" ALTER COLUMN id SET DEFAULT nextval('public."badge-acquisitions_id_seq"'::regclass);
 F   ALTER TABLE public."badge-acquisitions" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    264    265    265            o           2604    17378    badge-criteria id    DEFAULT     z   ALTER TABLE ONLY public."badge-criteria" ALTER COLUMN id SET DEFAULT nextval('public."badge-criteria_id_seq"'::regclass);
 B   ALTER TABLE public."badge-criteria" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    273    274    274            h           2604    17308    badge-partner-competences id    DEFAULT     �   ALTER TABLE ONLY public."badge-partner-competences" ALTER COLUMN id SET DEFAULT nextval('public."badge-partner-competences_id_seq"'::regclass);
 M   ALTER TABLE public."badge-partner-competences" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    266    267    267            b           2604    17239 	   badges id    DEFAULT     f   ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);
 8   ALTER TABLE public.badges ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    261    260    261            F           2604    16812    campaign-participations id    DEFAULT     �   ALTER TABLE ONLY public."campaign-participations" ALTER COLUMN id SET DEFAULT nextval('public."campaign-participations_id_seq"'::regclass);
 K   ALTER TABLE public."campaign-participations" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    241    240    241            ?           2604    16762    campaigns id    DEFAULT     l   ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);
 ;   ALTER TABLE public.campaigns ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    237    236    237            Y           2604    16980    certification-candidates id    DEFAULT     �   ALTER TABLE ONLY public."certification-candidates" ALTER COLUMN id SET DEFAULT nextval('public."certification-candidates_id_seq"'::regclass);
 L   ALTER TABLE public."certification-candidates" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    254    255    255            T           2604    16912 #   certification-center-memberships id    DEFAULT     �   ALTER TABLE ONLY public."certification-center-memberships" ALTER COLUMN id SET DEFAULT nextval('public."certification-center-memberships_id_seq"'::regclass);
 T   ALTER TABLE public."certification-center-memberships" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    250    251    251            Q           2604    16901    certification-centers id    DEFAULT     �   ALTER TABLE ONLY public."certification-centers" ALTER COLUMN id SET DEFAULT nextval('public."certification-centers_id_seq"'::regclass);
 I   ALTER TABLE public."certification-centers" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    248    249    249            .           2604    16591    certification-challenges id    DEFAULT     �   ALTER TABLE ONLY public."certification-challenges" ALTER COLUMN id SET DEFAULT nextval('public."certification-challenges_id_seq"'::regclass);
 L   ALTER TABLE public."certification-challenges" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    223    223            (           2604    16581    certification-courses id    DEFAULT     �   ALTER TABLE ONLY public."certification-courses" ALTER COLUMN id SET DEFAULT nextval('public."certification-courses_id_seq"'::regclass);
 I   ALTER TABLE public."certification-courses" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    220    221            V           2604    16949    competence-evaluations id    DEFAULT     �   ALTER TABLE ONLY public."competence-evaluations" ALTER COLUMN id SET DEFAULT nextval('public."competence-evaluations_id_seq"'::regclass);
 J   ALTER TABLE public."competence-evaluations" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    252    253    253            8           2604    16715    competence-marks id    DEFAULT     ~   ALTER TABLE ONLY public."competence-marks" ALTER COLUMN id SET DEFAULT nextval('public."competence-marks_id_seq"'::regclass);
 D   ALTER TABLE public."competence-marks" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    232    233    233                       2604    16476    feedbacks id    DEFAULT     l   ALTER TABLE ONLY public.feedbacks ALTER COLUMN id SET DEFAULT nextval('public.feedbacks_id_seq'::regclass);
 ;   ALTER TABLE public.feedbacks ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    214    215            	           2604    16391    knex_migrations id    DEFAULT     x   ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);
 A   ALTER TABLE public.knex_migrations ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    204    205    205            
           2604    16399    knex_migrations_lock index    DEFAULT     �   ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);
 I   ALTER TABLE public.knex_migrations_lock ALTER COLUMN index DROP DEFAULT;
       public          postgres    false    206    207    207            p           2604    17409    knowledge-element-snapshots id    DEFAULT     �   ALTER TABLE ONLY public."knowledge-element-snapshots" ALTER COLUMN id SET DEFAULT nextval('public."knowledge-element-snapshots_id_seq"'::regclass);
 O   ALTER TABLE public."knowledge-element-snapshots" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    276    275    276            C           2604    16787    knowledge-elements id    DEFAULT     �   ALTER TABLE ONLY public."knowledge-elements" ALTER COLUMN id SET DEFAULT nextval('public."knowledge-elements_id_seq"'::regclass);
 F   ALTER TABLE public."knowledge-elements" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    238    239    239            :           2604    16742    memberships id    DEFAULT     }   ALTER TABLE ONLY public.memberships ALTER COLUMN id SET DEFAULT nextval('public."organizations-accesses_id_seq"'::regclass);
 =   ALTER TABLE public.memberships ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    234    235    235            ^           2604    17192    organization-invitations id    DEFAULT     �   ALTER TABLE ONLY public."organization-invitations" ALTER COLUMN id SET DEFAULT nextval('public."organization-invitations_id_seq"'::regclass);
 L   ALTER TABLE public."organization-invitations" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    258    259    259            w           2604    17465    organization-tags id    DEFAULT     �   ALTER TABLE ONLY public."organization-tags" ALTER COLUMN id SET DEFAULT nextval('public."organization-tags_id_seq"'::regclass);
 E   ALTER TABLE public."organization-tags" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    281    282    282                       2604    16502    organizations id    DEFAULT     t   ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);
 ?   ALTER TABLE public.organizations ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    217    217            4           2604    16647    pix_roles id    DEFAULT     l   ALTER TABLE ONLY public.pix_roles ALTER COLUMN id SET DEFAULT nextval('public.pix_roles_id_seq'::regclass);
 ;   ALTER TABLE public.pix_roles ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    226    227    227            $           2604    16546    reset-password-demands id    DEFAULT     �   ALTER TABLE ONLY public."reset-password-demands" ALTER COLUMN id SET DEFAULT nextval('public."reset-password-demands_id_seq"'::regclass);
 J   ALTER TABLE public."reset-password-demands" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    218    219            \           2604    17002    schooling-registrations id    DEFAULT     {   ALTER TABLE ONLY public."schooling-registrations" ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);
 K   ALTER TABLE public."schooling-registrations" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    257    256    257            1           2604    16631    sessions id    DEFAULT     j   ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);
 :   ALTER TABLE public.sessions ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    224    225    225            q           2604    17427 	   stages id    DEFAULT     f   ALTER TABLE ONLY public.stages ALTER COLUMN id SET DEFAULT nextval('public.stages_id_seq'::regclass);
 8   ALTER TABLE public.stages ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    278    277    278            t           2604    17453    tags id    DEFAULT     b   ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);
 6   ALTER TABLE public.tags ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    279    280    280            O           2604    16876    target-profile-shares id    DEFAULT     �   ALTER TABLE ONLY public."target-profile-shares" ALTER COLUMN id SET DEFAULT nextval('public."target-profile-shares_id_seq"'::regclass);
 I   ALTER TABLE public."target-profile-shares" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    247    246    247            I           2604    16833    target-profiles id    DEFAULT     |   ALTER TABLE ONLY public."target-profiles" ALTER COLUMN id SET DEFAULT nextval('public."target-profiles_id_seq"'::regclass);
 C   ALTER TABLE public."target-profiles" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    242    243    243            N           2604    16849    target-profiles_skills id    DEFAULT     �   ALTER TABLE ONLY public."target-profiles_skills" ALTER COLUMN id SET DEFAULT nextval('public."target-profiles_skills_id_seq"'::regclass);
 J   ALTER TABLE public."target-profiles_skills" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    245    244    245            l           2604    17363    tutorial-evaluations id    DEFAULT     �   ALTER TABLE ONLY public."tutorial-evaluations" ALTER COLUMN id SET DEFAULT nextval('public."tutorial-evaluations_id_seq"'::regclass);
 H   ALTER TABLE public."tutorial-evaluations" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    271    272    272            c           2604    17256    user-orga-settings id    DEFAULT     �   ALTER TABLE ONLY public."user-orga-settings" ALTER COLUMN id SET DEFAULT nextval('public."user-orga-settings_id_seq"'::regclass);
 F   ALTER TABLE public."user-orga-settings" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    262    263    263            i           2604    17330    user_tutorials id    DEFAULT     v   ALTER TABLE ONLY public.user_tutorials ALTER COLUMN id SET DEFAULT nextval('public.user_tutorials_id_seq'::regclass);
 @   ALTER TABLE public.user_tutorials ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    268    269    269                       2604    16407    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    209    208    209            5           2604    16655    users_pix_roles id    DEFAULT     x   ALTER TABLE ONLY public.users_pix_roles ALTER COLUMN id SET DEFAULT nextval('public.users_pix_roles_id_seq'::regclass);
 A   ALTER TABLE public.users_pix_roles ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    228    229    229            �          0    16430    answers 
   TABLE DATA           �   COPY public.answers (id, value, result, "assessmentId", "challengeId", "createdAt", "updatedAt", timeout, "elapsedTime", "resultDetails") FROM stdin;
    public          postgres    false    213   �       �          0    16683    assessment-results 
   TABLE DATA           �   COPY public."assessment-results" (id, "createdAt", level, "pixScore", emitter, "commentForJury", "commentForOrganization", "commentForCandidate", status, "juryId", "assessmentId") FROM stdin;
    public          postgres    false    231   w$      �          0    16417    assessments 
   TABLE DATA           �   COPY public.assessments (id, "courseId", "createdAt", "updatedAt", "userId", type, state, "competenceId", "isImproving", "campaignParticipationId", "certificationCourseId") FROM stdin;
    public          postgres    false    211   �$      �          0    17280    badge-acquisitions 
   TABLE DATA           T   COPY public."badge-acquisitions" (id, "createdAt", "userId", "badgeId") FROM stdin;
    public          postgres    false    265   3%                0    17375    badge-criteria 
   TABLE DATA           K   COPY public."badge-criteria" (id, scope, threshold, "badgeId") FROM stdin;
    public          postgres    false    274   P%                 0    17305    badge-partner-competences 
   TABLE DATA           ]   COPY public."badge-partner-competences" (id, name, "skillIds", color, "badgeId") FROM stdin;
    public          postgres    false    267   m%      �          0    17236    badges 
   TABLE DATA           f   COPY public.badges (id, "altMessage", "imageUrl", message, "targetProfileId", key, title) FROM stdin;
    public          postgres    false    261   �%      �          0    16809    campaign-participations 
   TABLE DATA           �   COPY public."campaign-participations" (id, "campaignId", "createdAt", "isShared", "sharedAt", "userId", "participantExternalId") FROM stdin;
    public          postgres    false    241   �%      �          0    16759 	   campaigns 
   TABLE DATA           �   COPY public.campaigns (id, name, code, "organizationId", "creatorId", "createdAt", "targetProfileId", "idPixLabel", title, "customLandingPageText", "archivedAt", type, "externalIdHelpImageUrl", "alternativeTextToExternalIdHelpImage") FROM stdin;
    public          postgres    false    237   �%      �          0    16977    certification-candidates 
   TABLE DATA           �   COPY public."certification-candidates" (id, "firstName", "lastName", "birthCity", "externalId", birthdate, "createdAt", "sessionId", "extraTimePercentage", "birthProvinceCode", "birthCountry", "userId", email, "resultRecipientEmail") FROM stdin;
    public          postgres    false    255   �%      �          0    16909     certification-center-memberships 
   TABLE DATA           p   COPY public."certification-center-memberships" (id, "userId", "certificationCenterId", "createdAt") FROM stdin;
    public          postgres    false    251   �%      �          0    16898    certification-centers 
   TABLE DATA           \   COPY public."certification-centers" (id, name, "createdAt", "externalId", type) FROM stdin;
    public          postgres    false    249   &      �          0    16588    certification-challenges 
   TABLE DATA           �   COPY public."certification-challenges" (id, "challengeId", "competenceId", "associatedSkillName", "courseId", "createdAt", "updatedAt", "associatedSkillId") FROM stdin;
    public          postgres    false    223   8&      �          0    16578    certification-courses 
   TABLE DATA             COPY public."certification-courses" (id, "createdAt", "updatedAt", "userId", "completedAt", "firstName", "lastName", birthdate, birthplace, "sessionId", "externalId", "isPublished", "isV2Certification", "examinerComment", "hasSeenEndTestScreen", "verificationCode") FROM stdin;
    public          postgres    false    221   U&      �          0    16946    competence-evaluations 
   TABLE DATA           �   COPY public."competence-evaluations" (id, "assessmentId", "userId", "competenceId", "createdAt", "updatedAt", status) FROM stdin;
    public          postgres    false    253   r&      �          0    16712    competence-marks 
   TABLE DATA           �   COPY public."competence-marks" (id, level, score, area_code, competence_code, "createdAt", "assessmentResultId", "competenceId") FROM stdin;
    public          postgres    false    233   �&      �          0    16473 	   feedbacks 
   TABLE DATA           {   COPY public.feedbacks (id, content, "assessmentId", "challengeId", "createdAt", "updatedAt", category, answer) FROM stdin;
    public          postgres    false    215   �&      �          0    16388    knex_migrations 
   TABLE DATA           J   COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
    public          postgres    false    205   '      �          0    16396    knex_migrations_lock 
   TABLE DATA           @   COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
    public          postgres    false    207   $<      	          0    17406    knowledge-element-snapshots 
   TABLE DATA           \   COPY public."knowledge-element-snapshots" (id, "userId", "snappedAt", snapshot) FROM stdin;
    public          postgres    false    276   E<      �          0    16784    knowledge-elements 
   TABLE DATA           �   COPY public."knowledge-elements" (id, source, status, "createdAt", "answerId", "assessmentId", "skillId", "earnedPix", "userId", "competenceId") FROM stdin;
    public          postgres    false    239   b<      �          0    16739    memberships 
   TABLE DATA           �   COPY public.memberships (id, "userId", "organizationId", "organizationRole", "createdAt", "updatedAt", "disabledAt", "updatedByUserId") FROM stdin;
    public          postgres    false    235   �@      �          0    17189    organization-invitations 
   TABLE DATA              COPY public."organization-invitations" (id, "organizationId", email, status, "createdAt", "updatedAt", code, role) FROM stdin;
    public          postgres    false    259   �@                0    17462    organization-tags 
   TABLE DATA           f   COPY public."organization-tags" (id, "organizationId", "tagId", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    282   �@      �          0    16499    organizations 
   TABLE DATA           �   COPY public.organizations (id, type, name, "createdAt", "updatedAt", "logoUrl", "externalId", "isManagingStudents", "provinceCode", credit, "canCollectProfiles", email) FROM stdin;
    public          postgres    false    217   �@                0    17339    partner-certifications 
   TABLE DATA           c   COPY public."partner-certifications" ("certificationCourseId", "partnerKey", acquired) FROM stdin;
    public          postgres    false    270   A      �          0    16644 	   pix_roles 
   TABLE DATA           -   COPY public.pix_roles (id, name) FROM stdin;
    public          postgres    false    227   -A      �          0    16543    reset-password-demands 
   TABLE DATA           m   COPY public."reset-password-demands" (id, email, "temporaryKey", used, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    219   _A      �          0    16999    schooling-registrations 
   TABLE DATA           �  COPY public."schooling-registrations" (id, "userId", "organizationId", "firstName", "lastName", birthdate, "createdAt", "updatedAt", "preferredLastName", "middleName", "thirdName", "birthCity", "birthCityCode", "birthProvinceCode", "birthCountryCode", "MEFCode", status, "nationalStudentId", division, email, "studentNumber", department, "educationalTeam", "group", diploma, "isSupernumerary") FROM stdin;
    public          postgres    false    257   |A      �          0    16628    sessions 
   TABLE DATA             COPY public.sessions (id, "certificationCenter", address, room, examiner, date, "time", description, "createdAt", "accessCode", "certificationCenterId", "examinerGlobalComment", "finalizedAt", "resultsSentToPrescriberAt", "publishedAt", "assignedCertificationOfficerId") FROM stdin;
    public          postgres    false    225   �A                0    17424    stages 
   TABLE DATA           l   COPY public.stages (id, "targetProfileId", title, message, threshold, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    278   �A                0    17450    tags 
   TABLE DATA           B   COPY public.tags (id, name, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    280   �A      �          0    16873    target-profile-shares 
   TABLE DATA           g   COPY public."target-profile-shares" (id, "targetProfileId", "organizationId", "createdAt") FROM stdin;
    public          postgres    false    247   �A      �          0    16830    target-profiles 
   TABLE DATA           v   COPY public."target-profiles" (id, name, "isPublic", "organizationId", "createdAt", outdated, "imageUrl") FROM stdin;
    public          postgres    false    243   B      �          0    16846    target-profiles_skills 
   TABLE DATA           T   COPY public."target-profiles_skills" (id, "targetProfileId", "skillId") FROM stdin;
    public          postgres    false    245   *B                0    17360    tutorial-evaluations 
   TABLE DATA           f   COPY public."tutorial-evaluations" (id, "userId", "tutorialId", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    272   GB      �          0    17253    user-orga-settings 
   TABLE DATA           o   COPY public."user-orga-settings" (id, "userId", "currentOrganizationId", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    263   dB                0    17327    user_tutorials 
   TABLE DATA           ^   COPY public.user_tutorials (id, "userId", "tutorialId", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    269   �B      �          0    16404    users 
   TABLE DATA           <  COPY public.users (id, "firstName", "lastName", email, password, "createdAt", "updatedAt", cgu, "pixOrgaTermsOfServiceAccepted", "samlId", "pixCertifTermsOfServiceAccepted", "hasSeenAssessmentInstructions", username, "shouldChangePassword", "mustValidateTermsOfService", "lastTermsOfServiceValidatedAt") FROM stdin;
    public          postgres    false    209   �B      �          0    16652    users_pix_roles 
   TABLE DATA           C   COPY public.users_pix_roles (id, user_id, pix_role_id) FROM stdin;
    public          postgres    false    229   ;C      =           0    0    answers_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.answers_id_seq', 20, true);
          public          postgres    false    212            >           0    0    assessment-results_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."assessment-results_id_seq"', 1, false);
          public          postgres    false    230            ?           0    0    assessments_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.assessments_id_seq', 1, true);
          public          postgres    false    210            @           0    0    badge-acquisitions_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."badge-acquisitions_id_seq"', 1, false);
          public          postgres    false    264            A           0    0    badge-criteria_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."badge-criteria_id_seq"', 1, false);
          public          postgres    false    273            B           0    0     badge-partner-competences_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('public."badge-partner-competences_id_seq"', 1, false);
          public          postgres    false    266            C           0    0    badges_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.badges_id_seq', 1, false);
          public          postgres    false    260            D           0    0    campaign-participations_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public."campaign-participations_id_seq"', 1, false);
          public          postgres    false    240            E           0    0    campaigns_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.campaigns_id_seq', 1, false);
          public          postgres    false    236            F           0    0    certification-candidates_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public."certification-candidates_id_seq"', 1, false);
          public          postgres    false    254            G           0    0 '   certification-center-memberships_id_seq    SEQUENCE SET     X   SELECT pg_catalog.setval('public."certification-center-memberships_id_seq"', 1, false);
          public          postgres    false    250            H           0    0    certification-centers_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."certification-centers_id_seq"', 1, false);
          public          postgres    false    248            I           0    0    certification-challenges_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public."certification-challenges_id_seq"', 1, false);
          public          postgres    false    222            J           0    0    certification-courses_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."certification-courses_id_seq"', 1, false);
          public          postgres    false    220            K           0    0    competence-evaluations_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."competence-evaluations_id_seq"', 1, true);
          public          postgres    false    252            L           0    0    competence-marks_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."competence-marks_id_seq"', 1, false);
          public          postgres    false    232            M           0    0    feedbacks_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.feedbacks_id_seq', 1, false);
          public          postgres    false    214            N           0    0    knex_migrations_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.knex_migrations_id_seq', 220, true);
          public          postgres    false    204            O           0    0    knex_migrations_lock_index_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);
          public          postgres    false    206            P           0    0 "   knowledge-element-snapshots_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public."knowledge-element-snapshots_id_seq"', 1, false);
          public          postgres    false    275            Q           0    0    knowledge-elements_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."knowledge-elements_id_seq"', 44, true);
          public          postgres    false    238            R           0    0    organization-invitations_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public."organization-invitations_id_seq"', 1, false);
          public          postgres    false    258            S           0    0    organization-tags_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public."organization-tags_id_seq"', 1, false);
          public          postgres    false    281            T           0    0    organizations-accesses_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public."organizations-accesses_id_seq"', 1, false);
          public          postgres    false    234            U           0    0    organizations_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.organizations_id_seq', 1, false);
          public          postgres    false    216            V           0    0    pix_roles_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.pix_roles_id_seq', 2, true);
          public          postgres    false    226            W           0    0    reset-password-demands_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public."reset-password-demands_id_seq"', 1, false);
          public          postgres    false    218            X           0    0    sessions_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.sessions_id_seq', 1, false);
          public          postgres    false    224            Y           0    0    stages_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.stages_id_seq', 1, false);
          public          postgres    false    277            Z           0    0    students_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.students_id_seq', 1, false);
          public          postgres    false    256            [           0    0    tags_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.tags_id_seq', 1, false);
          public          postgres    false    279            \           0    0    target-profile-shares_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."target-profile-shares_id_seq"', 1, false);
          public          postgres    false    246            ]           0    0    target-profiles_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public."target-profiles_id_seq"', 1, false);
          public          postgres    false    242            ^           0    0    target-profiles_skills_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public."target-profiles_skills_id_seq"', 1, false);
          public          postgres    false    244            _           0    0    tutorial-evaluations_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public."tutorial-evaluations_id_seq"', 1, false);
          public          postgres    false    271            `           0    0    user-orga-settings_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."user-orga-settings_id_seq"', 1, false);
          public          postgres    false    262            a           0    0    user_tutorials_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.user_tutorials_id_seq', 1, false);
          public          postgres    false    268            b           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 1, true);
          public          postgres    false    208            c           0    0    users_pix_roles_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.users_pix_roles_id_seq', 1, false);
          public          postgres    false    228            �           2606    16440    answers answers_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.answers DROP CONSTRAINT answers_pkey;
       public            postgres    false    213            �           2606    16692 *   assessment-results assessment-results_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."assessment-results"
    ADD CONSTRAINT "assessment-results_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."assessment-results" DROP CONSTRAINT "assessment-results_pkey";
       public            postgres    false    231            �           2606    16427    assessments assessments_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_pkey;
       public            postgres    false    211            �           2606    17302 ;   assessments assessments_userid_certificationcourseid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_userid_certificationcourseid_unique UNIQUE ("userId", "certificationCourseId");
 e   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_userid_certificationcourseid_unique;
       public            postgres    false    211    211            �           2606    17286 *   badge-acquisitions badge-acquisitions_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."badge-acquisitions"
    ADD CONSTRAINT "badge-acquisitions_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."badge-acquisitions" DROP CONSTRAINT "badge-acquisitions_pkey";
       public            postgres    false    265            �           2606    17380 "   badge-criteria badge-criteria_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."badge-criteria"
    ADD CONSTRAINT "badge-criteria_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."badge-criteria" DROP CONSTRAINT "badge-criteria_pkey";
       public            postgres    false    274            �           2606    17313 8   badge-partner-competences badge-partner-competences_pkey 
   CONSTRAINT     z   ALTER TABLE ONLY public."badge-partner-competences"
    ADD CONSTRAINT "badge-partner-competences_pkey" PRIMARY KEY (id);
 f   ALTER TABLE ONLY public."badge-partner-competences" DROP CONSTRAINT "badge-partner-competences_pkey";
       public            postgres    false    267            �           2606    17321    badges badges_key_unique 
   CONSTRAINT     R   ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_key_unique UNIQUE (key);
 B   ALTER TABLE ONLY public.badges DROP CONSTRAINT badges_key_unique;
       public            postgres    false    261            �           2606    17244    badges badges_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.badges DROP CONSTRAINT badges_pkey;
       public            postgres    false    261            �           2606    16815 4   campaign-participations campaign-participations_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public."campaign-participations"
    ADD CONSTRAINT "campaign-participations_pkey" PRIMARY KEY (id);
 b   ALTER TABLE ONLY public."campaign-participations" DROP CONSTRAINT "campaign-participations_pkey";
       public            postgres    false    241            �           2606    16974 H   campaign-participations campaign_participations_campaignid_userid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public."campaign-participations"
    ADD CONSTRAINT campaign_participations_campaignid_userid_unique UNIQUE ("campaignId", "userId");
 t   ALTER TABLE ONLY public."campaign-participations" DROP CONSTRAINT campaign_participations_campaignid_userid_unique;
       public            postgres    false    241    241            �           2606    16769    campaigns campaigns_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.campaigns DROP CONSTRAINT campaigns_pkey;
       public            postgres    false    237            �           2606    16986 6   certification-candidates certification-candidates_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public."certification-candidates"
    ADD CONSTRAINT "certification-candidates_pkey" PRIMARY KEY (id);
 d   ALTER TABLE ONLY public."certification-candidates" DROP CONSTRAINT "certification-candidates_pkey";
       public            postgres    false    255            �           2606    16915 F   certification-center-memberships certification-center-memberships_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public."certification-center-memberships"
    ADD CONSTRAINT "certification-center-memberships_pkey" PRIMARY KEY (id);
 t   ALTER TABLE ONLY public."certification-center-memberships" DROP CONSTRAINT "certification-center-memberships_pkey";
       public            postgres    false    251            �           2606    16904 0   certification-centers certification-centers_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public."certification-centers"
    ADD CONSTRAINT "certification-centers_pkey" PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public."certification-centers" DROP CONSTRAINT "certification-centers_pkey";
       public            postgres    false    249            �           2606    16598 6   certification-challenges certification-challenges_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public."certification-challenges"
    ADD CONSTRAINT "certification-challenges_pkey" PRIMARY KEY (id);
 d   ALTER TABLE ONLY public."certification-challenges" DROP CONSTRAINT "certification-challenges_pkey";
       public            postgres    false    223            �           2606    16585 0   certification-courses certification-courses_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public."certification-courses"
    ADD CONSTRAINT "certification-courses_pkey" PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public."certification-courses" DROP CONSTRAINT "certification-courses_pkey";
       public            postgres    false    221            �           2606    17215 I   certification-candidates certification_candidates_sessionid_userid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public."certification-candidates"
    ADD CONSTRAINT certification_candidates_sessionid_userid_unique UNIQUE ("sessionId", "userId");
 u   ALTER TABLE ONLY public."certification-candidates" DROP CONSTRAINT certification_candidates_sessionid_userid_unique;
       public            postgres    false    255    255            �           2606    17069 `   certification-center-memberships certification_center_memberships_userid_certificationcenterid_u 
   CONSTRAINT     �   ALTER TABLE ONLY public."certification-center-memberships"
    ADD CONSTRAINT certification_center_memberships_userid_certificationcenterid_u UNIQUE ("userId", "certificationCenterId");
 �   ALTER TABLE ONLY public."certification-center-memberships" DROP CONSTRAINT certification_center_memberships_userid_certificationcenterid_u;
       public            postgres    false    251    251            �           2606    16953 2   competence-evaluations competence-evaluations_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public."competence-evaluations"
    ADD CONSTRAINT "competence-evaluations_pkey" PRIMARY KEY (id);
 `   ALTER TABLE ONLY public."competence-evaluations" DROP CONSTRAINT "competence-evaluations_pkey";
       public            postgres    false    253            �           2606    16721 &   competence-marks competence-marks_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."competence-marks"
    ADD CONSTRAINT "competence-marks_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."competence-marks" DROP CONSTRAINT "competence-marks_pkey";
       public            postgres    false    233            �           2606    16483    feedbacks feedbacks_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.feedbacks DROP CONSTRAINT feedbacks_pkey;
       public            postgres    false    215            }           2606    16401 .   knex_migrations_lock knex_migrations_lock_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);
 X   ALTER TABLE ONLY public.knex_migrations_lock DROP CONSTRAINT knex_migrations_lock_pkey;
       public            postgres    false    207            {           2606    16393 $   knex_migrations knex_migrations_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.knex_migrations DROP CONSTRAINT knex_migrations_pkey;
       public            postgres    false    205                        2606    17414 <   knowledge-element-snapshots knowledge-element-snapshots_pkey 
   CONSTRAINT     ~   ALTER TABLE ONLY public."knowledge-element-snapshots"
    ADD CONSTRAINT "knowledge-element-snapshots_pkey" PRIMARY KEY (id);
 j   ALTER TABLE ONLY public."knowledge-element-snapshots" DROP CONSTRAINT "knowledge-element-snapshots_pkey";
       public            postgres    false    276            �           2606    16793 *   knowledge-elements knowledge-elements_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."knowledge-elements"
    ADD CONSTRAINT "knowledge-elements_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."knowledge-elements" DROP CONSTRAINT "knowledge-elements_pkey";
       public            postgres    false    239                       2606    17420 O   knowledge-element-snapshots knowledge_element_snapshots_userid_snappedat_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public."knowledge-element-snapshots"
    ADD CONSTRAINT knowledge_element_snapshots_userid_snappedat_unique UNIQUE ("userId", "snappedAt");
 {   ALTER TABLE ONLY public."knowledge-element-snapshots" DROP CONSTRAINT knowledge_element_snapshots_userid_snappedat_unique;
       public            postgres    false    276    276            �           2606    17199 6   organization-invitations organization-invitations_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public."organization-invitations"
    ADD CONSTRAINT "organization-invitations_pkey" PRIMARY KEY (id);
 d   ALTER TABLE ONLY public."organization-invitations" DROP CONSTRAINT "organization-invitations_pkey";
       public            postgres    false    259                       2606    17469 (   organization-tags organization-tags_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public."organization-tags"
    ADD CONSTRAINT "organization-tags_pkey" PRIMARY KEY (id);
 V   ALTER TABLE ONLY public."organization-tags" DROP CONSTRAINT "organization-tags_pkey";
       public            postgres    false    282                       2606    17483 ?   organization-tags organization_tags_organizationid_tagid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public."organization-tags"
    ADD CONSTRAINT organization_tags_organizationid_tagid_unique UNIQUE ("organizationId", "tagId");
 k   ALTER TABLE ONLY public."organization-tags" DROP CONSTRAINT organization_tags_organizationid_tagid_unique;
       public            postgres    false    282    282            �           2606    16744 '   memberships organizations-accesses_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT "organizations-accesses_pkey" PRIMARY KEY (id);
 S   ALTER TABLE ONLY public.memberships DROP CONSTRAINT "organizations-accesses_pkey";
       public            postgres    false    235            �           2606    16510     organizations organizations_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.organizations DROP CONSTRAINT organizations_pkey;
       public            postgres    false    217            �           2606    16649    pix_roles pix_roles_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.pix_roles
    ADD CONSTRAINT pix_roles_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.pix_roles DROP CONSTRAINT pix_roles_pkey;
       public            postgres    false    227            �           2606    16554 2   reset-password-demands reset-password-demands_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public."reset-password-demands"
    ADD CONSTRAINT "reset-password-demands_pkey" PRIMARY KEY (id);
 `   ALTER TABLE ONLY public."reset-password-demands" DROP CONSTRAINT "reset-password-demands_pkey";
       public            postgres    false    219            �           2606    16638    sessions sessions_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_pkey;
       public            postgres    false    225                       2606    17434    stages stages_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.stages DROP CONSTRAINT stages_pkey;
       public            postgres    false    278            �           2606    17233 H   schooling-registrations students_organizationid_nationalstudentid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public."schooling-registrations"
    ADD CONSTRAINT students_organizationid_nationalstudentid_unique UNIQUE ("organizationId", "nationalStudentId");
 t   ALTER TABLE ONLY public."schooling-registrations" DROP CONSTRAINT students_organizationid_nationalstudentid_unique;
       public            postgres    false    257    257            �           2606    17009 %   schooling-registrations students_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public."schooling-registrations"
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);
 Q   ALTER TABLE ONLY public."schooling-registrations" DROP CONSTRAINT students_pkey;
       public            postgres    false    257            �           2606    17224 =   schooling-registrations students_userid_organizationid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public."schooling-registrations"
    ADD CONSTRAINT students_userid_organizationid_unique UNIQUE ("userId", "organizationId");
 i   ALTER TABLE ONLY public."schooling-registrations" DROP CONSTRAINT students_userid_organizationid_unique;
       public            postgres    false    257    257                       2606    17459    tags tags_name_unique 
   CONSTRAINT     P   ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_unique UNIQUE (name);
 ?   ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_name_unique;
       public            postgres    false    280            	           2606    17457    tags tags_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_pkey;
       public            postgres    false    280            �           2606    16879 0   target-profile-shares target-profile-shares_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public."target-profile-shares"
    ADD CONSTRAINT "target-profile-shares_pkey" PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public."target-profile-shares" DROP CONSTRAINT "target-profile-shares_pkey";
       public            postgres    false    247            �           2606    16837 $   target-profiles target-profiles_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."target-profiles"
    ADD CONSTRAINT "target-profiles_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."target-profiles" DROP CONSTRAINT "target-profiles_pkey";
       public            postgres    false    243            �           2606    16851 2   target-profiles_skills target-profiles_skills_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public."target-profiles_skills"
    ADD CONSTRAINT "target-profiles_skills_pkey" PRIMARY KEY (id);
 `   ALTER TABLE ONLY public."target-profiles_skills" DROP CONSTRAINT "target-profiles_skills_pkey";
       public            postgres    false    245            �           2606    17367 .   tutorial-evaluations tutorial-evaluations_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public."tutorial-evaluations"
    ADD CONSTRAINT "tutorial-evaluations_pkey" PRIMARY KEY (id);
 \   ALTER TABLE ONLY public."tutorial-evaluations" DROP CONSTRAINT "tutorial-evaluations_pkey";
       public            postgres    false    272            �           2606    17371 B   tutorial-evaluations tutorial_evaluations_userid_tutorialid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public."tutorial-evaluations"
    ADD CONSTRAINT tutorial_evaluations_userid_tutorialid_unique UNIQUE ("userId", "tutorialId");
 n   ALTER TABLE ONLY public."tutorial-evaluations" DROP CONSTRAINT tutorial_evaluations_userid_tutorialid_unique;
       public            postgres    false    272    272            �           2606    17258 *   user-orga-settings user-orga-settings_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."user-orga-settings"
    ADD CONSTRAINT "user-orga-settings_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."user-orga-settings" DROP CONSTRAINT "user-orga-settings_pkey";
       public            postgres    false    263            �           2606    17271 3   user-orga-settings user_orga_settings_userid_unique 
   CONSTRAINT     t   ALTER TABLE ONLY public."user-orga-settings"
    ADD CONSTRAINT user_orga_settings_userid_unique UNIQUE ("userId");
 _   ALTER TABLE ONLY public."user-orga-settings" DROP CONSTRAINT user_orga_settings_userid_unique;
       public            postgres    false    263            �           2606    17334 "   user_tutorials user_tutorials_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.user_tutorials
    ADD CONSTRAINT user_tutorials_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.user_tutorials DROP CONSTRAINT user_tutorials_pkey;
       public            postgres    false    269            �           2606    17338 6   user_tutorials user_tutorials_userid_tutorialid_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.user_tutorials
    ADD CONSTRAINT user_tutorials_userid_tutorialid_unique UNIQUE ("userId", "tutorialId");
 `   ALTER TABLE ONLY public.user_tutorials DROP CONSTRAINT user_tutorials_userid_tutorialid_unique;
       public            postgres    false    269    269                       2606    16490    users users_email_unique 
   CONSTRAINT     T   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_unique;
       public            postgres    false    209            �           2606    16657 $   users_pix_roles users_pix_roles_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.users_pix_roles
    ADD CONSTRAINT users_pix_roles_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.users_pix_roles DROP CONSTRAINT users_pix_roles_pkey;
       public            postgres    false    229            �           2606    16414    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    209            �           2606    16894    users users_samlid_unique 
   CONSTRAINT     X   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_samlid_unique UNIQUE ("samlId");
 C   ALTER TABLE ONLY public.users DROP CONSTRAINT users_samlid_unique;
       public            postgres    false    209            �           2606    17227    users users_username_unique 
   CONSTRAINT     Z   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);
 E   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_unique;
       public            postgres    false    209            �           1259    16674    answers_assessmentid_index    INDEX     X   CREATE INDEX answers_assessmentid_index ON public.answers USING btree ("assessmentId");
 .   DROP INDEX public.answers_assessmentid_index;
       public            postgres    false    213            �           1259    16703 %   assessment_results_assessmentid_index    INDEX     p   CREATE INDEX assessment_results_assessmentid_index ON public."assessment-results" USING btree ("assessmentId");
 9   DROP INDEX public.assessment_results_assessmentid_index;
       public            postgres    false    231            �           1259    17033 )   assessments_campaignparticipationid_index    INDEX     v   CREATE INDEX assessments_campaignparticipationid_index ON public.assessments USING btree ("campaignParticipationId");
 =   DROP INDEX public.assessments_campaignparticipationid_index;
       public            postgres    false    211            �           1259    17277 '   assessments_certificationcourseid_index    INDEX     r   CREATE INDEX assessments_certificationcourseid_index ON public.assessments USING btree ("certificationCourseId");
 ;   DROP INDEX public.assessments_certificationcourseid_index;
       public            postgres    false    211            �           1259    17034    assessments_userid_index    INDEX     T   CREATE INDEX assessments_userid_index ON public.assessments USING btree ("userId");
 ,   DROP INDEX public.assessments_userid_index;
       public            postgres    false    211            �           1259    17292    badge_acquisitions_userid_index    INDEX     d   CREATE INDEX badge_acquisitions_userid_index ON public."badge-acquisitions" USING btree ("userId");
 3   DROP INDEX public.badge_acquisitions_userid_index;
       public            postgres    false    265            �           1259    17386    badge_criteria_badgeid_index    INDEX     ^   CREATE INDEX badge_criteria_badgeid_index ON public."badge-criteria" USING btree ("badgeId");
 0   DROP INDEX public.badge_criteria_badgeid_index;
       public            postgres    false    274            �           1259    17319 '   badge_partner_competences_badgeid_index    INDEX     t   CREATE INDEX badge_partner_competences_badgeid_index ON public."badge-partner-competences" USING btree ("badgeId");
 ;   DROP INDEX public.badge_partner_competences_badgeid_index;
       public            postgres    false    267            �           1259    17250    badges_targetprofileid_index    INDEX     \   CREATE INDEX badges_targetprofileid_index ON public.badges USING btree ("targetProfileId");
 0   DROP INDEX public.badges_targetprofileid_index;
       public            postgres    false    261            �           1259    16870 $   campaign_participations_userid_index    INDEX     n   CREATE INDEX campaign_participations_userid_index ON public."campaign-participations" USING btree ("userId");
 8   DROP INDEX public.campaign_participations_userid_index;
       public            postgres    false    241            �           1259    16770    campaigns_code_index    INDEX     J   CREATE INDEX campaigns_code_index ON public.campaigns USING btree (code);
 (   DROP INDEX public.campaigns_code_index;
       public            postgres    false    237            �           1259    16776    campaigns_organizationid_index    INDEX     `   CREATE INDEX campaigns_organizationid_index ON public.campaigns USING btree ("organizationId");
 2   DROP INDEX public.campaigns_organizationid_index;
       public            postgres    false    237            �           1259    16863    campaigns_targetprofileid_index    INDEX     b   CREATE INDEX campaigns_targetprofileid_index ON public.campaigns USING btree ("targetProfileId");
 3   DROP INDEX public.campaigns_targetprofileid_index;
       public            postgres    false    237            �           1259    17083 '   certification_challenges_courseid_index    INDEX     t   CREATE INDEX certification_challenges_courseid_index ON public."certification-challenges" USING btree ("courseId");
 ;   DROP INDEX public.certification_challenges_courseid_index;
       public            postgres    false    223            �           1259    16673 %   certification_courses_sessionid_index    INDEX     p   CREATE INDEX certification_courses_sessionid_index ON public."certification-courses" USING btree ("sessionId");
 9   DROP INDEX public.certification_courses_sessionid_index;
       public            postgres    false    221            �           1259    16609 "   certification_courses_userid_index    INDEX     j   CREATE INDEX certification_courses_userid_index ON public."certification-courses" USING btree ("userId");
 6   DROP INDEX public.certification_courses_userid_index;
       public            postgres    false    221            �           1259    17347 >   certification_partner_acquisitions_certificationcourseid_index    INDEX     �   CREATE INDEX certification_partner_acquisitions_certificationcourseid_index ON public."partner-certifications" USING btree ("certificationCourseId");
 R   DROP INDEX public.certification_partner_acquisitions_certificationcourseid_index;
       public            postgres    false    270            �           1259    16959 )   competence_evaluations_assessmentid_index    INDEX     x   CREATE INDEX competence_evaluations_assessmentid_index ON public."competence-evaluations" USING btree ("assessmentId");
 =   DROP INDEX public.competence_evaluations_assessmentid_index;
       public            postgres    false    253            �           1259    16965 #   competence_evaluations_userid_index    INDEX     l   CREATE INDEX competence_evaluations_userid_index ON public."competence-evaluations" USING btree ("userId");
 7   DROP INDEX public.competence_evaluations_userid_index;
       public            postgres    false    253            �           1259    16727 )   competence_marks_assessmentresultid_index    INDEX     x   CREATE INDEX competence_marks_assessmentresultid_index ON public."competence-marks" USING btree ("assessmentResultId");
 =   DROP INDEX public.competence_marks_assessmentresultid_index;
       public            postgres    false    233            �           1259    17421 3   index_certification_courses_upper_verification_code    INDEX     �   CREATE UNIQUE INDEX index_certification_courses_upper_verification_code ON public."certification-courses" USING btree (upper(("verificationCode")::text));
 G   DROP INDEX public.index_certification_courses_upper_verification_code;
       public            postgres    false    221    221            �           1259    16942    knowledge_elements_userid_index    INDEX     d   CREATE INDEX knowledge_elements_userid_index ON public."knowledge-elements" USING btree ("userId");
 3   DROP INDEX public.knowledge_elements_userid_index;
       public            postgres    false    239            �           1259    17229     memberships_organizationid_index    INDEX     d   CREATE INDEX memberships_organizationid_index ON public.memberships USING btree ("organizationId");
 4   DROP INDEX public.memberships_organizationid_index;
       public            postgres    false    235            �           1259    17447 3   memberships_userid_organizationid_disabledat_unique    INDEX     �   CREATE UNIQUE INDEX memberships_userid_organizationid_disabledat_unique ON public.memberships USING btree ("userId", "organizationId") WHERE ("disabledAt" IS NULL);
 G   DROP INDEX public.memberships_userid_organizationid_disabledat_unique;
       public            postgres    false    235    235    235            �           1259    17205 -   organization_invitations_organizationid_index    INDEX     �   CREATE INDEX organization_invitations_organizationid_index ON public."organization-invitations" USING btree ("organizationId");
 A   DROP INDEX public.organization_invitations_organizationid_index;
       public            postgres    false    259                       1259    17475 &   organization_tags_organizationid_index    INDEX     r   CREATE INDEX organization_tags_organizationid_index ON public."organization-tags" USING btree ("organizationId");
 :   DROP INDEX public.organization_tags_organizationid_index;
       public            postgres    false    282                       1259    17481    organization_tags_tagid_index    INDEX     `   CREATE INDEX organization_tags_tagid_index ON public."organization-tags" USING btree ("tagId");
 1   DROP INDEX public.organization_tags_tagid_index;
       public            postgres    false    282            �           1259    17445 "   organizationid_studentnumber_index    INDEX     �   CREATE INDEX organizationid_studentnumber_index ON public."schooling-registrations" USING btree ("organizationId", "studentNumber");
 6   DROP INDEX public.organizationid_studentnumber_index;
       public            postgres    false    257    257            �           1259    17446 3   organizationid_studentnumber_notsupernumerary_index    INDEX     �   CREATE UNIQUE INDEX organizationid_studentnumber_notsupernumerary_index ON public."schooling-registrations" USING btree ("organizationId", "studentNumber") WHERE ("isSupernumerary" IS FALSE);
 G   DROP INDEX public.organizationid_studentnumber_notsupernumerary_index;
       public            postgres    false    257    257    257            �           1259    16555 "   reset_password_demands_email_index    INDEX     h   CREATE INDEX reset_password_demands_email_index ON public."reset-password-demands" USING btree (email);
 6   DROP INDEX public.reset_password_demands_email_index;
       public            postgres    false    219            �           1259    16556 )   reset_password_demands_temporarykey_index    INDEX     x   CREATE INDEX reset_password_demands_temporarykey_index ON public."reset-password-demands" USING btree ("temporaryKey");
 =   DROP INDEX public.reset_password_demands_temporarykey_index;
       public            postgres    false    219            �           1259    17416 /   schooling-registrations_nationalstudentid_index    INDEX     �   CREATE INDEX "schooling-registrations_nationalstudentid_index" ON public."schooling-registrations" USING btree ("nationalStudentId");
 E   DROP INDEX public."schooling-registrations_nationalstudentid_index";
       public            postgres    false    257            �           1259    17231    sessions_accesscode_index    INDEX     V   CREATE INDEX sessions_accesscode_index ON public.sessions USING btree ("accessCode");
 -   DROP INDEX public.sessions_accesscode_index;
       public            postgres    false    225            �           1259    16935 $   sessions_certificationcenterid_index    INDEX     l   CREATE INDEX sessions_certificationcenterid_index ON public.sessions USING btree ("certificationCenterId");
 8   DROP INDEX public.sessions_certificationcenterid_index;
       public            postgres    false    225                       1259    17440    stages_targetprofileid_index    INDEX     \   CREATE INDEX stages_targetprofileid_index ON public.stages USING btree ("targetProfileId");
 0   DROP INDEX public.stages_targetprofileid_index;
       public            postgres    false    278            �           1259    16891 *   target_profile_shares_organizationid_index    INDEX     z   CREATE INDEX target_profile_shares_organizationid_index ON public."target-profile-shares" USING btree ("organizationId");
 >   DROP INDEX public.target_profile_shares_organizationid_index;
       public            postgres    false    247            �           1259    16885 +   target_profile_shares_targetprofileid_index    INDEX     |   CREATE INDEX target_profile_shares_targetprofileid_index ON public."target-profile-shares" USING btree ("targetProfileId");
 ?   DROP INDEX public.target_profile_shares_targetprofileid_index;
       public            postgres    false    247            �           1259    16843 $   target_profiles_organizationid_index    INDEX     n   CREATE INDEX target_profiles_organizationid_index ON public."target-profiles" USING btree ("organizationId");
 8   DROP INDEX public.target_profiles_organizationid_index;
       public            postgres    false    243            �           1259    16857 ,   target_profiles_skills_targetprofileid_index    INDEX     ~   CREATE INDEX target_profiles_skills_targetprofileid_index ON public."target-profiles_skills" USING btree ("targetProfileId");
 @   DROP INDEX public.target_profiles_skills_targetprofileid_index;
       public            postgres    false    245            �           1259    17264    user_orga_settings_userid_index    INDEX     d   CREATE INDEX user_orga_settings_userid_index ON public."user-orga-settings" USING btree ("userId");
 3   DROP INDEX public.user_orga_settings_userid_index;
       public            postgres    false    263                       2606    16441 $   answers answers_assessmentid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_assessmentid_foreign FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id);
 N   ALTER TABLE ONLY public.answers DROP CONSTRAINT answers_assessmentid_foreign;
       public          postgres    false    211    3209    213                       2606    16698 :   assessment-results assessment_results_assessmentid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."assessment-results"
    ADD CONSTRAINT assessment_results_assessmentid_foreign FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id);
 f   ALTER TABLE ONLY public."assessment-results" DROP CONSTRAINT assessment_results_assessmentid_foreign;
       public          postgres    false    211    3209    231                       2606    16693 4   assessment-results assessment_results_juryid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."assessment-results"
    ADD CONSTRAINT assessment_results_juryid_foreign FOREIGN KEY ("juryId") REFERENCES public.users(id);
 `   ALTER TABLE ONLY public."assessment-results" DROP CONSTRAINT assessment_results_juryid_foreign;
       public          postgres    false    3201    209    231                       2606    17028 7   assessments assessments_campaignparticipationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_campaignparticipationid_foreign FOREIGN KEY ("campaignParticipationId") REFERENCES public."campaign-participations"(id);
 a   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_campaignparticipationid_foreign;
       public          postgres    false    3259    211    241                       2606    17272 5   assessments assessments_certificationcourseid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_certificationcourseid_foreign FOREIGN KEY ("certificationCourseId") REFERENCES public."certification-courses"(id);
 _   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_certificationcourseid_foreign;
       public          postgres    false    221    3225    211                       2606    17035 &   assessments assessments_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 P   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_userid_foreign;
       public          postgres    false    3201    209    211            ;           2606    17293 5   badge-acquisitions badge_acquisitions_badgeid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."badge-acquisitions"
    ADD CONSTRAINT badge_acquisitions_badgeid_foreign FOREIGN KEY ("badgeId") REFERENCES public.badges(id);
 a   ALTER TABLE ONLY public."badge-acquisitions" DROP CONSTRAINT badge_acquisitions_badgeid_foreign;
       public          postgres    false    3302    261    265            :           2606    17287 4   badge-acquisitions badge_acquisitions_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."badge-acquisitions"
    ADD CONSTRAINT badge_acquisitions_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 `   ALTER TABLE ONLY public."badge-acquisitions" DROP CONSTRAINT badge_acquisitions_userid_foreign;
       public          postgres    false    209    265    3201            ?           2606    17381 -   badge-criteria badge_criteria_badgeid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."badge-criteria"
    ADD CONSTRAINT badge_criteria_badgeid_foreign FOREIGN KEY ("badgeId") REFERENCES public.badges(id);
 Y   ALTER TABLE ONLY public."badge-criteria" DROP CONSTRAINT badge_criteria_badgeid_foreign;
       public          postgres    false    261    3302    274            <           2606    17314 C   badge-partner-competences badge_partner_competences_badgeid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."badge-partner-competences"
    ADD CONSTRAINT badge_partner_competences_badgeid_foreign FOREIGN KEY ("badgeId") REFERENCES public.badges(id);
 o   ALTER TABLE ONLY public."badge-partner-competences" DROP CONSTRAINT badge_partner_competences_badgeid_foreign;
       public          postgres    false    261    3302    267            7           2606    17245 %   badges badges_targetprofileid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_targetprofileid_foreign FOREIGN KEY ("targetProfileId") REFERENCES public."target-profiles"(id);
 O   ALTER TABLE ONLY public.badges DROP CONSTRAINT badges_targetprofileid_foreign;
       public          postgres    false    243    3264    261            (           2606    16816 B   campaign-participations campaign_participations_campaignid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."campaign-participations"
    ADD CONSTRAINT campaign_participations_campaignid_foreign FOREIGN KEY ("campaignId") REFERENCES public.campaigns(id);
 n   ALTER TABLE ONLY public."campaign-participations" DROP CONSTRAINT campaign_participations_campaignid_foreign;
       public          postgres    false    237    241    3253            )           2606    16865 >   campaign-participations campaign_participations_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."campaign-participations"
    ADD CONSTRAINT campaign_participations_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 j   ALTER TABLE ONLY public."campaign-participations" DROP CONSTRAINT campaign_participations_userid_foreign;
       public          postgres    false    3201    209    241            #           2606    16777 %   campaigns campaigns_creatorid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_creatorid_foreign FOREIGN KEY ("creatorId") REFERENCES public.users(id);
 O   ALTER TABLE ONLY public.campaigns DROP CONSTRAINT campaigns_creatorid_foreign;
       public          postgres    false    3201    237    209            "           2606    16771 *   campaigns campaigns_organizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_organizationid_foreign FOREIGN KEY ("organizationId") REFERENCES public.organizations(id);
 T   ALTER TABLE ONLY public.campaigns DROP CONSTRAINT campaigns_organizationid_foreign;
       public          postgres    false    237    3219    217            $           2606    16858 +   campaigns campaigns_targetprofileid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_targetprofileid_foreign FOREIGN KEY ("targetProfileId") REFERENCES public."target-profiles"(id);
 U   ALTER TABLE ONLY public.campaigns DROP CONSTRAINT campaigns_targetprofileid_foreign;
       public          postgres    false    3264    243    237            2           2606    16987 C   certification-candidates certification_candidates_sessionid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."certification-candidates"
    ADD CONSTRAINT certification_candidates_sessionid_foreign FOREIGN KEY ("sessionId") REFERENCES public.sessions(id);
 o   ALTER TABLE ONLY public."certification-candidates" DROP CONSTRAINT certification_candidates_sessionid_foreign;
       public          postgres    false    3235    255    225            3           2606    17208 @   certification-candidates certification_candidates_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."certification-candidates"
    ADD CONSTRAINT certification_candidates_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 l   ALTER TABLE ONLY public."certification-candidates" DROP CONSTRAINT certification_candidates_userid_foreign;
       public          postgres    false    255    3201    209            /           2606    17071 _   certification-center-memberships certification_center_memberships_certificationcenterid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."certification-center-memberships"
    ADD CONSTRAINT certification_center_memberships_certificationcenterid_foreign FOREIGN KEY ("certificationCenterId") REFERENCES public."certification-centers"(id);
 �   ALTER TABLE ONLY public."certification-center-memberships" DROP CONSTRAINT certification_center_memberships_certificationcenterid_foreign;
       public          postgres    false    251    3274    249            .           2606    17056 P   certification-center-memberships certification_center_memberships_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."certification-center-memberships"
    ADD CONSTRAINT certification_center_memberships_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 |   ALTER TABLE ONLY public."certification-center-memberships" DROP CONSTRAINT certification_center_memberships_userid_foreign;
       public          postgres    false    3201    251    209                       2606    17084 B   certification-challenges certification_challenges_courseid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."certification-challenges"
    ADD CONSTRAINT certification_challenges_courseid_foreign FOREIGN KEY ("courseId") REFERENCES public."certification-courses"(id);
 n   ALTER TABLE ONLY public."certification-challenges" DROP CONSTRAINT certification_challenges_courseid_foreign;
       public          postgres    false    223    3225    221                       2606    16668 =   certification-courses certification_courses_sessionid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."certification-courses"
    ADD CONSTRAINT certification_courses_sessionid_foreign FOREIGN KEY ("sessionId") REFERENCES public.sessions(id);
 i   ALTER TABLE ONLY public."certification-courses" DROP CONSTRAINT certification_courses_sessionid_foreign;
       public          postgres    false    221    3235    225                       2606    16604 :   certification-courses certification_courses_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."certification-courses"
    ADD CONSTRAINT certification_courses_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 f   ALTER TABLE ONLY public."certification-courses" DROP CONSTRAINT certification_courses_userid_foreign;
       public          postgres    false    3201    221    209            =           2606    17342 V   partner-certifications certification_partner_acquisitions_certificationcourseid_foreig    FK CONSTRAINT     �   ALTER TABLE ONLY public."partner-certifications"
    ADD CONSTRAINT certification_partner_acquisitions_certificationcourseid_foreig FOREIGN KEY ("certificationCourseId") REFERENCES public."certification-courses"(id);
 �   ALTER TABLE ONLY public."partner-certifications" DROP CONSTRAINT certification_partner_acquisitions_certificationcourseid_foreig;
       public          postgres    false    270    3225    221            >           2606    17348 L   partner-certifications certification_partner_acquisitions_partnerkey_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."partner-certifications"
    ADD CONSTRAINT certification_partner_acquisitions_partnerkey_foreign FOREIGN KEY ("partnerKey") REFERENCES public.badges(key);
 x   ALTER TABLE ONLY public."partner-certifications" DROP CONSTRAINT certification_partner_acquisitions_partnerkey_foreign;
       public          postgres    false    261    3300    270            0           2606    16954 B   competence-evaluations competence_evaluations_assessmentid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."competence-evaluations"
    ADD CONSTRAINT competence_evaluations_assessmentid_foreign FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id);
 n   ALTER TABLE ONLY public."competence-evaluations" DROP CONSTRAINT competence_evaluations_assessmentid_foreign;
       public          postgres    false    3209    211    253            1           2606    16960 <   competence-evaluations competence_evaluations_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."competence-evaluations"
    ADD CONSTRAINT competence_evaluations_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 h   ALTER TABLE ONLY public."competence-evaluations" DROP CONSTRAINT competence_evaluations_userid_foreign;
       public          postgres    false    3201    253    209                       2606    16722 <   competence-marks competence_marks_assessmentresultid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."competence-marks"
    ADD CONSTRAINT competence_marks_assessmentresultid_foreign FOREIGN KEY ("assessmentResultId") REFERENCES public."assessment-results"(id);
 h   ALTER TABLE ONLY public."competence-marks" DROP CONSTRAINT competence_marks_assessmentresultid_foreign;
       public          postgres    false    3241    231    233                       2606    16484 (   feedbacks feedbacks_assessmentid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_assessmentid_foreign FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id);
 R   ALTER TABLE ONLY public.feedbacks DROP CONSTRAINT feedbacks_assessmentid_foreign;
       public          postgres    false    215    3209    211            %           2606    16794 6   knowledge-elements knowledge_elements_answerid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."knowledge-elements"
    ADD CONSTRAINT knowledge_elements_answerid_foreign FOREIGN KEY ("answerId") REFERENCES public.answers(id);
 b   ALTER TABLE ONLY public."knowledge-elements" DROP CONSTRAINT knowledge_elements_answerid_foreign;
       public          postgres    false    3215    239    213            &           2606    16800 :   knowledge-elements knowledge_elements_assessmentid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."knowledge-elements"
    ADD CONSTRAINT knowledge_elements_assessmentid_foreign FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id);
 f   ALTER TABLE ONLY public."knowledge-elements" DROP CONSTRAINT knowledge_elements_assessmentid_foreign;
       public          postgres    false    239    211    3209            '           2606    16937 4   knowledge-elements knowledge_elements_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."knowledge-elements"
    ADD CONSTRAINT knowledge_elements_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 `   ALTER TABLE ONLY public."knowledge-elements" DROP CONSTRAINT knowledge_elements_userid_foreign;
       public          postgres    false    239    209    3201            !           2606    17397 /   memberships memberships_updatedbyuserid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_updatedbyuserid_foreign FOREIGN KEY ("updatedByUserId") REFERENCES public.users(id);
 Y   ALTER TABLE ONLY public.memberships DROP CONSTRAINT memberships_updatedbyuserid_foreign;
       public          postgres    false    209    235    3201            6           2606    17200 H   organization-invitations organization_invitations_organizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."organization-invitations"
    ADD CONSTRAINT organization_invitations_organizationid_foreign FOREIGN KEY ("organizationId") REFERENCES public.organizations(id);
 t   ALTER TABLE ONLY public."organization-invitations" DROP CONSTRAINT organization_invitations_organizationid_foreign;
       public          postgres    false    259    3219    217            A           2606    17470 :   organization-tags organization_tags_organizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."organization-tags"
    ADD CONSTRAINT organization_tags_organizationid_foreign FOREIGN KEY ("organizationId") REFERENCES public.organizations(id);
 f   ALTER TABLE ONLY public."organization-tags" DROP CONSTRAINT organization_tags_organizationid_foreign;
       public          postgres    false    3219    217    282            B           2606    17476 1   organization-tags organization_tags_tagid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."organization-tags"
    ADD CONSTRAINT organization_tags_tagid_foreign FOREIGN KEY ("tagId") REFERENCES public.tags(id);
 ]   ALTER TABLE ONLY public."organization-tags" DROP CONSTRAINT organization_tags_tagid_foreign;
       public          postgres    false    3337    282    280                        2606    17115 9   memberships organizations_accesses_organizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT organizations_accesses_organizationid_foreign FOREIGN KEY ("organizationId") REFERENCES public.organizations(id);
 c   ALTER TABLE ONLY public.memberships DROP CONSTRAINT organizations_accesses_organizationid_foreign;
       public          postgres    false    235    3219    217                       2606    17100 1   memberships organizations_accesses_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT organizations_accesses_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 [   ALTER TABLE ONLY public.memberships DROP CONSTRAINT organizations_accesses_userid_foreign;
       public          postgres    false    3201    235    209                       2606    17353 8   sessions sessions_assignedcertificationofficerid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_assignedcertificationofficerid_foreign FOREIGN KEY ("assignedCertificationOfficerId") REFERENCES public.users(id);
 b   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_assignedcertificationofficerid_foreign;
       public          postgres    false    225    3201    209                       2606    16930 /   sessions sessions_certificationcenterid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_certificationcenterid_foreign FOREIGN KEY ("certificationCenterId") REFERENCES public."certification-centers"(id);
 Y   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_certificationcenterid_foreign;
       public          postgres    false    3274    249    225            @           2606    17435 %   stages stages_targetprofileid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_targetprofileid_foreign FOREIGN KEY ("targetProfileId") REFERENCES public."target-profiles"(id);
 O   ALTER TABLE ONLY public.stages DROP CONSTRAINT stages_targetprofileid_foreign;
       public          postgres    false    243    3264    278            5           2606    17016 7   schooling-registrations students_organizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."schooling-registrations"
    ADD CONSTRAINT students_organizationid_foreign FOREIGN KEY ("organizationId") REFERENCES public.organizations(id);
 c   ALTER TABLE ONLY public."schooling-registrations" DROP CONSTRAINT students_organizationid_foreign;
       public          postgres    false    257    3219    217            4           2606    17010 /   schooling-registrations students_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."schooling-registrations"
    ADD CONSTRAINT students_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 [   ALTER TABLE ONLY public."schooling-registrations" DROP CONSTRAINT students_userid_foreign;
       public          postgres    false    257    3201    209            -           2606    16886 B   target-profile-shares target_profile_shares_organizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."target-profile-shares"
    ADD CONSTRAINT target_profile_shares_organizationid_foreign FOREIGN KEY ("organizationId") REFERENCES public.organizations(id);
 n   ALTER TABLE ONLY public."target-profile-shares" DROP CONSTRAINT target_profile_shares_organizationid_foreign;
       public          postgres    false    217    3219    247            ,           2606    16880 C   target-profile-shares target_profile_shares_targetprofileid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."target-profile-shares"
    ADD CONSTRAINT target_profile_shares_targetprofileid_foreign FOREIGN KEY ("targetProfileId") REFERENCES public."target-profiles"(id);
 o   ALTER TABLE ONLY public."target-profile-shares" DROP CONSTRAINT target_profile_shares_targetprofileid_foreign;
       public          postgres    false    243    247    3264            *           2606    16838 6   target-profiles target_profiles_organizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."target-profiles"
    ADD CONSTRAINT target_profiles_organizationid_foreign FOREIGN KEY ("organizationId") REFERENCES public.organizations(id);
 b   ALTER TABLE ONLY public."target-profiles" DROP CONSTRAINT target_profiles_organizationid_foreign;
       public          postgres    false    243    3219    217            +           2606    16852 E   target-profiles_skills target_profiles_skills_targetprofileid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."target-profiles_skills"
    ADD CONSTRAINT target_profiles_skills_targetprofileid_foreign FOREIGN KEY ("targetProfileId") REFERENCES public."target-profiles"(id);
 q   ALTER TABLE ONLY public."target-profiles_skills" DROP CONSTRAINT target_profiles_skills_targetprofileid_foreign;
       public          postgres    false    3264    245    243            9           2606    17265 C   user-orga-settings user_orga_settings_currentorganizationid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."user-orga-settings"
    ADD CONSTRAINT user_orga_settings_currentorganizationid_foreign FOREIGN KEY ("currentOrganizationId") REFERENCES public.organizations(id);
 o   ALTER TABLE ONLY public."user-orga-settings" DROP CONSTRAINT user_orga_settings_currentorganizationid_foreign;
       public          postgres    false    3219    263    217            8           2606    17259 4   user-orga-settings user_orga_settings_userid_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public."user-orga-settings"
    ADD CONSTRAINT user_orga_settings_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id);
 `   ALTER TABLE ONLY public."user-orga-settings" DROP CONSTRAINT user_orga_settings_userid_foreign;
       public          postgres    false    209    263    3201                       2606    17178 3   users_pix_roles users_pix_roles_pix_role_id_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_pix_roles
    ADD CONSTRAINT users_pix_roles_pix_role_id_foreign FOREIGN KEY (pix_role_id) REFERENCES public.pix_roles(id);
 ]   ALTER TABLE ONLY public.users_pix_roles DROP CONSTRAINT users_pix_roles_pix_role_id_foreign;
       public          postgres    false    227    3237    229                       2606    17169 /   users_pix_roles users_pix_roles_user_id_foreign    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_pix_roles
    ADD CONSTRAINT users_pix_roles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);
 Y   ALTER TABLE ONLY public.users_pix_roles DROP CONSTRAINT users_pix_roles_user_id_foreign;
       public          postgres    false    229    3201    209            �   z  x�}��r�8E��+\u����'3�$�L�-���"��kԿѿ�_���`���˻�����ԠgZ��A��0jn��h����Eh�@�4n��C�0�t������HCZ�'�GZCڏf�9j�Ђy�F�]�i<����s�ty�B6p,W�RJ��;�`-aKR�訡ّ&I�w)'��Y��[&D��9[�ӏ!9��B��� <%B��7	ㄟd �GZ0q���[3v�x��8}�h��ZT䄱>=��Ik����:\`c�.��d��2�sr���j��i���lX�#��=��{ʼ��(4�`�9<ί����(�TJ���u얪�h5������v�@Y�4M�K!I��b�\��Y��}���x�_�L G}QKI�ೋ��4"�@P�'F����Nq�W� 0��v)$�b�]\9gxkw���n:3��������(�j;<�)����s��!�'�;��m��T�CC�gFE���<HZx�A�5ڽf���S m��z�K��je$q+�y�clr��G�� �Tw��.�HC��ʚy��k?�/�1S@ �����c�5�����У\��9�ADOW+�c������0f9R�H&�*Yg�#ƣbw��w��N��>TD��B�>��E��r���C6�tc���;6(Y��X���S�X��r��� �X���L�������������o�#Q!`BUQUI���+C�}���~I�O�0�����T!\���]<4��ʛ��I���y�?L�
�\�R�	B��W�����1xp�ލv6���@��*
��t�Pe����Bc��+>Y)P@�.��.^~�כ�}=JdACA`��$$��$k�����u.#�����z�P6Ѣ8i�)�ت/:v��<+v`��gU�N���j��A      �      x������ � �      �   �   x�3���Qvu�Up��-H-I�KN�LQ�,V��CRp-K�)M,�����4202�54�52S04�2��26�310�60�'e�����������������Y\�XT���Y��\\�Sen�Q��bf̙��D\1z\\\ YN.�      �      x������ � �            x������ � �             x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   G   x�3�4¢���2�*�p����43cN##]C]#3Cc+cK+cc=CKm|R�%�E%�)\1z\\\ ȷl      �      x������ � �      �      x������ � �      �      x��\[o�ȱ~����P`ߛy��A<�S ��h�;�萒g�_���j��1��l�؝�Z_Uw���j�?�Rز�N%J���M}n�����oß��,Q��Y��(��6�R�W�?���JXmt?]C3O��� 5A8Y�Q��4|˪Py�����BJ!�*ը°kNu�v�zSʀ`���4������>�`{n���r��h�8�q$�/���;��"�F�
?�裲te%��qM���w_s�"�'UZaDY��E,^
�����pB:���~�m������l��XJ"�('0���\��@�]w�<��}3\����9��1��J����y���矺�f{��i��wOy��*l���j�ɗ��=?��������iN��'���K�Մl���Y��o��q{l^�c@v]�d�e��X��GgmO�m��S��Cwʬ��L�B�rK�ǜbe��@��=jd*0��F��-{��X�6{��ÔڰO���o����\�^8�kH'v�JT���h$Cs.�� �u���7O���%�+�����O^5�1h<�/{<T<�]��\��S�͌ �C�,Y�T�+��v��sn�}�L��W�������C��V�Kƶ�{pd�#1��q��9��̦$��*�R�����L�c=# ��T��	n1Z�]�+~�#�L�--5JF!��?Z[�pù>_���B����=�%�N-�ه����6�EpH��OY��n���1��0<c@��B)�}����k�����g�vn���������^"-�T�"eը6 ��5ՕI�����xߠ�cf_��d�JDH�ʔ�5Ť�o~kv�x@�~Y8�����JFy�)����߷}w�!XKKWA��k;w���6w�.X����ZΙE�:,���x����r84��&��AL�]��m2���� ��hX@<�6����S��A�v���CZ���^���`V�ܞ���̀x�^�`Z0E�I�{�I�Tv�G��F�64��xJ�J�6��k�O+Ne76 �2��A{�;��C7�4JY�w��T����F�ὐ��L�9�=��	��R��*I�jh̸�qϚ��8��6@����X�h!�B�~n�S}ܶߧ�eHa�yi�,%�*C9�>_���!3j
�O�,HW���T0�~Έd>\9���=ʆB�M'�P��ޱ!{p��#��S����M�?��/� ;�S@h0y^��}�a�v�3/2�9�C�Ʀ�������i��Cs�>��C��'}����s`֑�������pm��z �	��"f��(�]��양5�t�"��j�,[��cݳ	���jJ����</MI�1�z�Ө��b&eޔ������p�#D�k}s59�39n���Z)s��m����\�"���]���'e�t=CX��7�1W�N�4� �H�1�B�2U�6��\$���ؤ[����jmq��V)&{�j�o������b
r囋L�����e�X��}V22-P� rΐޏ@�� �,�eW�l�a�D��n�T)Q�9$��n��<��~<�ϋ{R�Jʒk���
�K*z�#UR9����,C��T�!���t9s�^m(6[�p͐����&l���k��+��M��x#G���w��T`Y�}F�ik+�X}��Ao�I�-?xKU�aH�nLM�B��I6zVP�reĴPrY�d�O�$l������5J�Ή
�@�U4����Q����iIG5���Lת�j1#�*��k��#X�;c�=}obk�[�WNG!�1��X����*�#C(T��I]!T������P7�Πe5��N�7��ip7���XMG�mq��.�+�gO�H��G�D�&ś��x��c�2�7ǞgJdGv<X���Wm�Ud�T=��	������T{VP�Ƌ[a[�4g؆��z�Ȋ�
Ͼg�|�f:W����]��bF����-�c�TP��%�Pid)�{!������|m{9����ٜ�s_C��vI?%E�L�B"�&���˩w�W�0Ԭڍ���I]����.�Q�-�]��}�Qֻ�3i�[�Tӭ)	,, ����<8��|�������		�E��" �E��Ԭk(X��T��o��"6#2Y��ͫ2�W���y��~��Q���hG���zP�ςj� (]�r�PK`�G�� phv^����"��jpW�nX�:(�|k��)R�΂c\vF�� R\�0�N��r�����T�߱�7o��Hj�T�o^B�"m�}���B��羽�7���d0m0��FLȳRH5��ׇ��k�pC�ؑ�!oz�H�N]�+�g)����	���@�y=X��i+?�j��4�v�9%�Md�앐uYʼL�v���8��b���`�J�� �#՝%�+"��}{�0[� i�X�� �=
��o��W��Ԣ�*�{����>~@�7��Z�MI�+P��Z��`Ŝ�j��8���/���D�5��?;���lR��O^�,o��`E7b���`H�3���\+�Q�Td��k����8�7�O�ɐr����Z�뢬R����X�P��nt�� �(S�J�[dƿ�!�Ԇ"�28Pk@t$
��<���[j#��	;QF*�&J\����!��E�p�1Ƅr�npE���??>k�dN����=�~Wu$;#ձX=�*d҄?����0�O����]�b)�`4�Q�i�\���DH�c���x��l�%�bS��:�����򱻈��U��&u�3�8��\q >���p*����!�Z����?I����$X¼K��X�ͷϤ�'�&�GW!�n�A� V�ѪJ��|�ɍ�e��v��{�Pl;�Y����X���&Ac>Uh4�-��Iȓ!���2�*Y[с�)(�@ұ5>���?�}���7���e�x���Q��[BXŮ{~-b��D(�!íW�Y���:ɾ+d�_u�p�a���:�9;-�Ȱ�p��[�.c�FP��.� �����"�Ŏ��'l�!F@�8�`��	UY�w�]�t����ц���((CWW�2NƠ�.!���B�Q��:Ȕn�������P������f8�A:nN����t`r���F>fFCw]�Ϥ�3	�Ҍ�P2�:���TpK.�3�96Ů.q�N���v~��;V�GWK"�&A�/��n�(c`�.a���_ՍfD�CB��%糺�=�/�����>�����NE
�xWex�0��e�Qb��ñ�����V��K��O��h|���a��,��L��
B��m�
$�Í-QD�ʹb-pp�X=K{-D��?���4g��}DzT'��$|����?�����9Ի�mr���
�B +т���)��Za�#����qU���"�ޔ�!S|�����F�j��8f�b~#o��W�(��Jt**�A����& _�I����`@�glShm���7���y�RL�0o�� ����	��􂵬�����U�m���u�&�$�j�|����qᗞk�uӸ�h�"�������B�nE;hFÇ&�����]��o�]��O����W�9���n ��Й����@�·���qaat
���8����
�ֵ��͂hvP��\P�)�����ɘ֍��4C�R�1�#÷�qKȸ	O�{��ǿq�Y�\�^���EyA�k��`'D�]�f���w���C��7�-SE,�i�W�8�ϔx�"q�����)'aF�C���}{��wP:��A�C A�#) �q�k��Y�0q�HX�=��'�4t��XY�W�8+��Gj6�k �&�h?�G�6��"�:^�d�a�9:��j�u�8���p�E�Z\f�xOU	k&V�ܣx��v\}m^q�n	�����N����&J��u��:�i[���Hic3㱻��ӡ���&w�2�~L�#J�T�����1��9�&����f]M�8B�Q(�/�o��[T�c��t҆C"%��(wQ�����Z��`\t>�J����竎�mI@�r�   A�!P��~Ḇ���W�.����5ъ�����(�7ԃ��$�����?���� ��9�q�n�9ǽU�S�$����捃��x�e�����������������/���@���9�]@��
�����Z��4�M��-�X�ηy���	Ǿ��]�!6��d���X4:vl�GΌ���e8�*5�Q_��i���]ӿ���>�+A���Z���-�(�!��$f�٥]�?� I�6��������ʉ�֗��3N�e;Z��I��Ƈ!³�#y��SCg'� �����a ��z`��CHmO��g�6q�2@��=�4����9��G��^ܬ�d�:J���͐�O�Q	��0P�E���k��ؖ!���W�Ȓ2x��Sx�P_	edz���3a}�h�ԉ>v=uYN��W��F�_��F/��6܂+8�h�!����0c$�
\K����+�#6���{�v@�Yo�GC�h�W7P�8c���I'��͎�]�J��&Cᅽ寯�h�6�%+1؈.g���5�ȀZŠ�a�OW�/2��WL���Mn�Ҏ�b�&@e����5�<йV�5������=�2��[�:|�d��ً��w��b��2bs+�bo>�����'�\�[:"��9k��sf�\�'�E,}�A��b�m��-H
�hI��tAoxgOF��;���\�����u��|2J/e�Q=���sT��<���T�����wp%y��% ��/�o^���.8�s��{�n��5,r��|辒`�&I{���>-��s�P�����|,6���aeD���xC���{9��0���Kf�&Um���\F��$TMB5�͓PH'ũi��9��\e��N���k�{9������A��6�],
eiq���Mqc���.pM7�����D����{NNK>9��ï*�����-ʻ��4�H����&� s|��KG�3���,�T�j��W�B 2I��Z��$|�~IXZ�DQ�!���2?"*���}��1Il�]4�g��ۖ2�r�ψ�n�I$q�0�E!M�٢�[���;�Q�\��I��]�^��/��������+d���F�u��/�|��Ov�;��X���5}�/=��Ƀ6*����cA߮ ����}���!�R���EaUp.��HI)�gӥ����F_�!Ş�����ߏ��y6��<�,�_\HQE\����}s�8�"~- �dY2�P�'��y��Q�� U9�!��e!\��k��O?�e��8      �      x�3�4������ V      	      x������ � �      �   *  x���K��H�������%�E�kQ���� f#*�(��cw�	e��ag�!O��pw�����~�2�m ��/~!����CI �O �~���ī=�h���&����==k70G���oQ��~�w���$*~�QI���18�Ηx��Y�d�;����Nd�����qg܇��85t�S�?����s��5t��r$K�d\2f�8�����=�Pq�/%��D���Cs�u�vmc���3-���F�'��h ���RC�0	����1�a1�y�e��2I�*�ID��`�r��'�2 ��D�١�8�Hq�݉�R^�����f/��+1��갶ݐ/�X�X�&*�iԱzp�'�D�YM o�<~���_���R:�����y��������&.H��ŋ\�  ��!Zb��Tn&���չN92@�@p���������nԎ��59�RX�{>FG+=(�%:��̊����I��%��2_�����맓/�O�S�Cj��Е�<>�(�\A�a>t}/=%r[�X>!�?�h�8n}���&O���/"=�\W�-c�9:�����<>QcR���G�Alյݩ�Q�U�+�Ie<�K�b,G�%�KE�WU�Zލmf5�Z1�Γq�݀�������&/g��w^�P�u�;��jĜY
_Οe`��Q�)�Z�����X���j%�-/;`L]U�B�U�;��e��9�*���^j��|!/��#�j%�%Q�(�i��q�x����V�97W?Z_b�fL�0_)O2���t�#�P�ԫ��/��|�9_�h�mC�YV�����J���h,��*K�a03�>S��F�	�TN�ʠ�u��7�z�x���?ڄ]˽��;�� c��2�C�c��2Ւ�>�=�su��6u�S}g�{˷l����u1��t=:�kT	O�+�(��:�Ir��؊>�D �Q�e�R�j+J�2J`7�lSh�}�"�M��K��SS�{�-�R˫�c���w:,��<��L��4�ͤ::�h3!���#Uk�ToW��\�2��Kx{{���`      �      x������ � �      �      x������ � �            x������ � �      �      x������ � �            x������ � �      �   "   x�3�����uq�2s�\]��=... ~UQ      �      x������ � �      �      x������ � �      �      x������ � �            x������ � �            x������ � �      �      x������ � �      �      x������ � �      �      x������ � �            x������ � �      �      x������ � �            x������ � �      �   �   x�3���KN�+�I-.�,�pJ�l���
��"N�$S�(Ӭ`���4��R'=�pc��(Ӝ�PC�t/s����@gG�@��젊2�B�JN##]C]#3Cc+cK+#K=csm|R%�i�1~@������ ��.      �      x������ � �     