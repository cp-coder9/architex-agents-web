Architectural Autonomous Platform — Full Product Requirements Document (PRD)

Version: 1.0
Prepared for: Apex Planners Pty Ltd
Prepared by: CEH SA
Date: 11 Dec 2025

1. Executive Summary

Apex Planners is developing an autonomous, admin-centric architectural workflow platform inspired by the frictionless customer experience of naked.insure. The system will allow clients to upload architectural plans, request compliance checks, commission new drawings, and track progress seamlessly.

The platform will automate the internal process using AI agents, supported by freelancers (human operators), with admin oversight and client experience prioritization.

The goal is to reduce manual workload for architects, create predictable workflows, and dramatically increase scalability and turnaround times.

2. Product Vision

Create a fully intelligent architectural operations platform where:

Any client can start and complete a project digitally with minimal friction.

Plans are validated by specialized AI agents for compliance with:

Johannesburg municipal regulations,

SANS 10400 (especially XA compliance),

National Building Regulations,

Architect-led internal standards.

Freelancers handle the drawing, while AI verifies the work.

The system dynamically notifies clients, assigns tasks, and maintains full transparency.

Admin oversees everything from a single dashboard.

3. Key Objectives

Frictionless onboarding similar to naked.insure (5–minute user flow).

AI-driven compliance checking of walls, dimensions, windows, doors, overlays, zoning, etc.

Hybrid human/AI workforce: freelancers + orchestrated agents.

Monetization via pay-to-proceed and plan-check or drawing packages.

Automated notifications, tracking, and client dashboard.

Scalable architecture allowing new AI agents to be added modularly.

4. User Types
4.1 Clients

Upload plans.

Request compliance checks.

Request new drawings or amendments.

Pay via online gateway.

Track project progress via web/app.

4.2 Freelancers

Receive available tasks.

Accept projects.

Upload deliverables.

Get paid automatically or manually by admin.

4.3 AI Agents

Handle automated workflow tasks.

Validate drawings.

Provide compliance reports.

Escalate unclear cases.

4.4 Admin

Full oversight of all projects.

Approve/reject freelancer submissions.

Override AI decisions if needed.

Manage payments, users, notifications.

5. End-to-End Workflow
5.1 Client Journey (Public Website → Project Creation)

1. Visitor arrives on landing page

Clean UI, simple CTA: “Start Your Plan Check / Upload Your Project”.

AI chat bubble available for guidance.

2. User chooses service:

Compliance Check

New Architectural Drawing

Additions/Alterations Proposal

Regulatory Query

3. User uploads data:

PDF plans, CAD files, images, sketches.

Brief description of the project.

4. Automatic assessment:

AI extracts metadata.

Project type classification.

Estimated timeline and cost displayed.

5. Payment step:

User pays online.

Payment unlocks dashboard + mobile app invitation.

6. Project created:

Orchestrator Agent assigns to the correct freelancer pool.

Client receives confirmation and expected timeline.

5.2 Internal Workflow (AI-Orchestrated)
1. Orchestrator Agent

Reads project type.

Determines required AI agents.

Chooses freelancers based on:

Workload,

Skill tags,

Availability.

2. Freelancer Task Assignment

Freelancer gets notification: “New Project Available”.

First qualified freelancer to accept gets the job.

3. Freelancer Output

Creates drawing or revision.

Uploads deliverables.

4. AI Compliance Pipeline Activates

The Orchestrator triggers multiple sub-agents:

A. Wall Agent

Checks thickness, material annotation, reinforcement if applicable.

Ensures walls meet SANS minimum standards.

Detects missing walls or discontinuities.

B. Dimension Agent

Detects all dimension strings.

Verifies:

Scale consistency,

Required minimum room sizes,

Correct placement of dimensions,

Legibility.

C. Window & Door Agent

Checks all window/door symbols.

Ensures proper schedules exist.

Matches size compliance.

Evaluates emergency egress.

D. Area/Space Agent

Computes room areas.

Validates against municipal & SANS minimum areas.

Checks zoning overlays (e.g., floor area ratios).

E. Energy/Insulation (XA) Agent

Evaluates:

Glazing ratios,

Wall insulation specs,

Roof insulation,

Orientation.

F. Council Readiness Agent

Aggregates all other agent outputs.

Flags missing items:

Site plan,

Sewer layout,

Title deed annotations,

North arrow,

Zoning certificate,

Drainage layout.

G. Compliance Formatter Agent

Compiles findings into a human-readable report.

Generates a “PASS / FAIL / WARNINGS” summary.

Suggests corrections.

5. AI Generates Report

Sent to freelancer for revisions if needed.

Sent to client if approved.

5.3 Admin Oversight Workflow

Admin dashboard includes:

Project list with statuses.

Real-time agent results.

Freelancer analytics.

Payment confirmations.

Errors & escalations.

Admin can override:

AI decisions,

Freelancer assignments,

Client communication templates.

6. System Features
6.1 Frontend Features

Web app (React, Next.js, Vue, or similar).

Interactive plan uploader.

Chat-style onboarding flow.

Auto-cost calculation.

Payment integration.

Progress tracking dashboard.

Push/email/SMS updates.

Mobile app companion (optional phase).

6.2 Backend Features

Authentication & authorization.

File parsing.

AI orchestration layer.

Freelancer job queue.

Compliance engine.

Plan storage + version management.

Notifications system.

Payment integration.

6.3 AI Features

Vision-based plan recognition.

CAD/PDF analysis.

Multi-agent architecture.

Orchestrator for agent delegation.

Compliance rule engine.

7. Architecture Overview
7.1 High-Level Technical Architecture
Client Browser → Frontend App → Backend API → Orchestrator AI Agent → Sub Agents
                                                     ↓                       ↑
                                                Freelancer App       Admin Dashboard

7.2 Components

Frontend (Web): React + Tailwind.

Backend: Node.js or Python FastAPI.

Database: PostgreSQL.

File Storage: S3 / Cloud Storage.

AI Pipeline: OpenAI API + Vision models.

Multi-Agent Framework: LangChain, OpenAI Agent Runtime, or custom orchestrator.

8. Phased Development Plan
Phase 1 — Foundational Platform

Client onboarding UI.

File upload pipeline.

Payment integration.

Project creation workflow.

Basic admin dashboard.

Freelancer module (accept/decline tasks).

Orchestrator skeleton (no AI compliance check yet).

Phase 2 — AI Compliance Engine (API-Based)

Wall Agent (vision-based).

Dimension Agent.

Window/Door Agent.

Council-Checklist Agent.

Orchestrator logic.

Compliance report generator.

Phase 3 — Mobile App

Client login & tracking.

Push notifications.

Document access.

Phase 4 — ML Training & Proprietary Models

Build custom trained models:

Wall detection,

Dimension reading,

CAD semantic segmentation.

Replace API calls with in-house models.

Phase 5 — Fully Autonomous Review

AI approves freelancer output.

Admin required only for escalations.

9. Tasks & Requirements (Detailed)
9.1 Frontend Tasks

Landing page UI/UX.

Plan uploader & validator.

Chat-like guided flow.

Payment screen + integration.

Client dashboard.

Responsive design.

Authentication screens.

9.2 Backend Tasks

Project models & DB schema.

PDF/CAD metadata extraction.

File versioning.

Orchestrator service interfaces.

Notification service (email/SMS).

User role management.

Payment webhooks.

Logging & monitoring.

9.3 AI Tasks

Develop agent prompts & rulebooks.

Build wall detection pipeline.

Build dimension extraction pipeline.

Build window/door detection.

Build compliance rules & constraints for JHB + SANS.

Orchestrator decision logic.

Create multi-agent communication flows.

9.4 Admin & Ops Tasks

Admin dashboard UI.

Freelancer payout module.

Error reporting.

Job audit logs.

10. KPIs

Client onboarding duration < 5 minutes.

80% of drawings approved by AI without human intervention within 6 months.

Conversion rate: visitor → plan upload > 40%.

Compliance report accuracy > 90%.

Freelancer acceptance time < 2 minutes.

11. Risks & Mitigations
Risk	Impact	Mitigation
AI misinterprets drawings	Medium	Human override, continuous tuning
Municipal rule changes	High	Rule engine updates
Poor-quality client uploads	Medium	Upload validation & quality scoring
Freelancer bottlenecks	Low	Larger freelancer pool
High initial API costs	Medium	Move to custom models in Phase 4
12. Final Deliverables

Fully autonomous architectural workflow platform.

Multi-agent AI compliance engine.

Client dashboard.

Admin oversight dashboard.

Freelancer marketplace module.

Payment system integration.

Comprehensive documentation.

Training data preparation for future model training.