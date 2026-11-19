const currentYear = new Date().getFullYear();
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ClipboardCheck,
  Wrench,
  Scale,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Camera,
  FolderLock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContextValue";
import "./LandingPage.css";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user?.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";

  return (
    <div className="landing-page">
      {/* 4.1 Navbar */}
      <header className="landing-nav">
        <div className="landing-nav__container">
          <Link to="/" className="landing-brand">
            <ShieldCheck size={26} className="landing-brand__icon" />
            <span className="landing-brand__name">RentGuard</span>
          </Link>

          <nav className="landing-nav__links">
            <a href="#four-pillars">Pillars</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#for-tenants">For Tenants</a>
            <a href="#for-landlords">For Landlords</a>
          </nav>

          <div className="landing-nav__actions">
            {isAuthenticated ? (
              <Link to={dashboardPath} className="btn-landing-primary">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav__login">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-landing-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 4.2 Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__container">
          <div className="landing-hero__badge">
            <Sparkles size={14} />
            <span>Next-Generation PropTech Documentation</span>
          </div>

          <h1 className="landing-hero__title">
            Your rental journey. <br />
            <span className="landing-hero__title-accent">Documented. Protected.</span>
          </h1>

          <p className="landing-hero__desc">
            Bring transparency to every rental relationship. Document property conditions,
            track maintenance, and resolve disagreements with immutable visual evidence.
          </p>

          <div className="landing-hero__cta-group">
            <Link to={isAuthenticated ? dashboardPath : "/signup"} className="btn-landing-hero-primary">
              Get Started <ArrowRight size={17} />
            </Link>
            <a href="#how-it-works" className="btn-landing-hero-secondary">
              Explore How It Works
            </a>
          </div>

          {/* Hero Visual Mockup Preview */}
          <div className="landing-hero__preview-wrapper">
            <div className="landing-preview-card">
              <div className="landing-preview-header">
                <div className="preview-dots">
                  <span className="dot dot--red"></span>
                  <span className="dot dot--yellow"></span>
                  <span className="dot dot--green"></span>
                </div>
                <span className="preview-address">42 Bougainvillea Lane, Indiranagar • Inspection Audit</span>
                <span className="preview-badge">Status: Verified</span>
              </div>
              <div className="landing-preview-grid">
                <div className="preview-room-card">
                  <div className="preview-room-title">Living Room — Move-In Condition</div>
                  <div className="preview-room-condition condition--good">Condition: Good (100% Verified)</div>
                  <p className="preview-room-notes">Freshly painted emulsion, no nail holes on north wall. Handover accepted.</p>
                </div>
                <div className="preview-room-card">
                  <div className="preview-room-title">Security Deposit Reconciliation</div>
                  <div className="preview-deposit-amount">₹84,000 Total Deposit Held</div>
                  <div className="preview-deposit-note">Zero unilateral deductions without photographic comparison proof.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.3 Problem Section */}
      <section className="landing-problem">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">The Rental Reality</span>
            <h2 className="landing-section-title">Rental disagreements start when records are missing.</h2>
            <p className="landing-section-sub">
              Without a synchronized single source of truth, tenants and landlords lose money, time, and goodwill.
            </p>
          </div>

          <div className="problem-cards-grid">
            <div className="problem-card">
              <div className="problem-card__icon-wrap">
                <Camera size={22} />
              </div>
              <h3>Scattered Photographs</h3>
              <p>Move-in photos lost in WhatsApp chats, buried under thousands of personal media files without timestamps.</p>
            </div>

            <div className="problem-card">
              <div className="problem-card__icon-wrap">
                <Wrench size={22} />
              </div>
              <h3>Unrecorded Maintenance</h3>
              <p>Repairs and recurring issues handled verbally with no audit trail of who approved or paid for contractor fixes.</p>
            </div>

            <div className="problem-card">
              <div className="problem-card__icon-wrap">
                <Scale size={22} />
              </div>
              <h3>Unclear Damage Liabilities</h3>
              <p>Disputes over normal wear-and-tear versus claimed damage at lease end with no comparative baseline.</p>
            </div>

            <div className="problem-card">
              <div className="problem-card__icon-wrap">
                <Lock size={22} />
              </div>
              <h3>Deposit Deductions</h3>
              <p>Arbitrary deductions from security deposits leading to frustration, delayed refunds, and hostile arguments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.4 Four Pillars Section */}
      <section id="four-pillars" className="landing-pillars">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">Core Architecture</span>
            <h2 className="landing-section-title">Built around four foundational pillars.</h2>
          </div>

          <div className="pillars-grid">
            <div className="pillar-item">
              <span className="pillar-number">01</span>
              <div className="pillar-badge">DOCUMENT</div>
              <h3>Original Condition Records</h3>
              <p>Document the property before moving in with structured, room-by-room photographic evidence and condition ratings.</p>
            </div>

            <div className="pillar-item">
              <span className="pillar-number">02</span>
              <div className="pillar-badge">TRACK</div>
              <h3>Maintenance Oversight</h3>
              <p>Monitor requests, priority updates, contractor visits, and landlord-tenant dialogue in a chronological ticket log.</p>
            </div>

            <div className="pillar-item">
              <span className="pillar-number">03</span>
              <div className="pillar-badge">COMPARE</div>
              <h3>Move-In vs Move-Out</h3>
              <p>Compare baseline room conditions against exit state side-by-side to objectively identify legitimate wear versus new damage.</p>
            </div>

            <div className="pillar-item">
              <span className="pillar-number">04</span>
              <div className="pillar-badge">RESOLVE</div>
              <h3>Itemized Deposit Settlement</h3>
              <p>Organize disputed claims, transparent itemized deductions, and mutual agreements without emotional arguments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 How It Works */}
      <section id="how-it-works" className="landing-how">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">Lifecycle Workflow</span>
            <h2 className="landing-section-title">How RentGuard guides your tenancy.</h2>
          </div>

          <div className="how-timeline">
            <div className="timeline-step">
              <div className="timeline-marker">1</div>
              <h4>Create Account & Connect Property</h4>
              <p>Landlord links tenancy agreement or tenant joins via secure lease invite.</p>
            </div>

            <div className="timeline-step">
              <div className="timeline-marker">2</div>
              <h4>Complete Move-In Inspection</h4>
              <p>Walk through every room, photograph fixtures, and submit the initial condition report.</p>
            </div>

            <div className="timeline-step">
              <div className="timeline-marker">3</div>
              <h4>Landlord Reviews & Confirms</h4>
              <p>Landlord certifies the report or flags specific items for mutual clarification.</p>
            </div>

            <div className="timeline-step">
              <div className="timeline-marker">4</div>
              <h4>Manage Repairs & Upkeep</h4>
              <p>Track maintenance requests and upload receipts during the active tenancy period.</p>
            </div>

            <div className="timeline-step">
              <div className="timeline-marker">5</div>
              <h4>Exit Comparison & Safe Refund</h4>
              <p>Perform exit walk-through, compare differences, and settle deposit refund clearly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.6 Features Grid */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">Engineered Features</span>
            <h2 className="landing-section-title">Everything you need for tenancy transparency.</h2>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <ClipboardCheck size={20} className="feature-icon" />
              <h4>Room-Wise Inspection</h4>
              <p>Tailored checklist for bedrooms, living room, bathrooms, kitchen, and balconies.</p>
            </div>

            <div className="feature-item">
              <Camera size={20} className="feature-icon" />
              <h4>Persistent Photo Vault</h4>
              <p>High-resolution image uploads with timestamp metadata stored in secure object storage.</p>
            </div>

            <div className="feature-item">
              <Layers size={20} className="feature-icon" />
              <h4>Delta Comparison Engine</h4>
              <p>Side-by-side analysis comparing move-in vs move-out state to verify wear and tear.</p>
            </div>

            <div className="feature-item">
              <Scale size={20} className="feature-icon" />
              <h4>Evidence-Linked Disputes</h4>
              <p>Raise claims backed by specific photos and inspection records rather than hearsay.</p>
            </div>

            <div className="feature-item">
              <FolderLock size={20} className="feature-icon" />
              <h4>Encrypted Document Vault</h4>
              <p>Store signed lease agreements, rent receipts, invoices, and government IDs safely.</p>
            </div>

            <div className="feature-item">
              <Sparkles size={20} className="feature-icon" />
              <h4>AI-Assisted Summaries</h4>
              <p>Optional intelligent vision comparison and structured inspection summaries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Sections: For Tenants & Landlords */}
      <section className="landing-roles" id="for-tenants">
        <div className="landing-container roles-split">
          <div className="role-col role-col--tenant">
            <span className="role-tag">For Tenants</span>
            <h3>Protect your deposit before you unpack.</h3>
            <ul className="role-perks">
              <li><CheckCircle2 size={16} /> Certified record of preexisting scratches, scuffs, and nail holes</li>
              <li><CheckCircle2 size={16} /> Direct channel to log maintenance issues with photos</li>
              <li><CheckCircle2 size={16} /> Defense against unfair end-of-lease deductions</li>
            </ul>
            <Link to="/signup" className="btn-role btn-role--tenant">Join as Tenant</Link>
          </div>

          <div className="role-col role-col--landlord" id="for-landlords">
            <span className="role-tag">For Landlords</span>
            <h3>Preserve asset value with structured documentation.</h3>
            <ul className="role-perks">
              <li><CheckCircle2 size={16} /> Standardized handover records signed digitally by tenants</li>
              <li><CheckCircle2 size={16} /> Track multiple managed units, tenancies, and repair tickets</li>
              <li><CheckCircle2 size={16} /> Clear itemized justification for legitimate deposit deductions</li>
            </ul>
            <Link to="/signup" className="btn-role btn-role--landlord">Join as Landlord</Link>
          </div>
        </div>
      </section>

      {/* 4.7 CTA & Footer */}
      <section className="landing-cta">
        <div className="landing-container landing-cta__box">
          <h2>Start your rental journey with clarity.</h2>
          <p>Join thousands of tenants and property owners building accountable, transparent rental relationships.</p>
          <Link to="/signup" className="btn-landing-cta">
            Create Free Account <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer__container">
          <div className="landing-footer__brand">
            <div className="landing-brand">
              <ShieldCheck size={24} className="landing-brand__icon" />
              <span className="landing-brand__name">RentGuard</span>
            </div>
            <p className="landing-footer__tagline">
              Smart Rental Property Documentation and Dispute Management Platform.
            </p>
          </div>

          <div className="landing-footer__links-col">
            <span className="footer-title">Product</span>
            <a href="#four-pillars">Four Pillars</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <Link to="/login">Sign In</Link>
          </div>

          <div className="landing-footer__links-col">
            <span className="footer-title">Platform</span>
            <a href="#for-tenants">For Tenants</a>
            <a href="#for-landlords">For Landlords</a>
            <Link to="/signup">Get Started</Link>
          </div>

          <div className="landing-footer__links-col">
            <span className="footer-title">Trust & Security</span>
            <span>256-bit SSL Encryption</span>
            <span>Role-Based Access Control</span>
            <span>Immutable Audit Trails</span>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p>© {currentYear} RentGuard PropTech Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

