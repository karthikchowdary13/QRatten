'use client';

import Link from 'next/link';
import {
  Activity,
  BarChart3,
  Check,
  Clock3,
  Cloud,
  GraduationCap,
  MapPin,
  QrCode,
  Settings,
  ShieldCheck,
  UserRound,
  FlaskConical,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';

const features = [
  {
    title: 'Prevent Proxy',
    description: 'Device validation and fraud detection',
    icon: ShieldCheck,
  },
  {
    title: 'Time-Based QR',
    description: 'QR rotates every 5 seconds',
    icon: Clock3,
  },
  {
    title: 'Location Verified',
    description: 'Attendance valid within the classroom',
    icon: MapPin,
  },
  {
    title: 'Real-Time',
    description: 'Instant attendance updates',
    icon: Activity,
  },
  {
    title: 'Cloud-Based',
    description: 'Access attendance from anywhere',
    icon: Cloud,
  },
];

const roles = [
  {
    title: 'For Students',
    subtitle: 'Scan. Attend. Track.',
    icon: GraduationCap,
    className: styles.studentRole,
    features: [
      'Scan time-based QR',
      'Attendance valid within location',
      'View attendance percentage',
      'Get alerts and reminders',
    ],
  },
  {
    title: 'For Teachers',
    subtitle: 'Create. Monitor. Analyze.',
    icon: UserRound,
    className: styles.teacherRole,
    features: [
      'Generate secure QR sessions',
      'Set classroom location and radius',
      'Monitor attendance live',
      'Detect suspicious activity',
    ],
  },
  {
    title: 'For Admins',
    subtitle: 'Manage. Secure. Optimize.',
    icon: Settings,
    className: styles.adminRole,
    features: [
      'Manage users and departments',
      'Monitor attendance across campus',
      'View fraud analytics and alerts',
      'Configure system settings',
    ],
  },
];

const recentStudents = [
  ['KR', 'Karthik R', '10:31:04'],
  ['HP', 'Hema P', '10:31:11'],
  ['RS', 'Rahul S', '10:31:17'],
  ['SV', 'Sneha V', '10:31:22'],
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ====================================================== */}

        <section id="home" className={styles.hero}>
          <div className={styles.heroBackground} />

          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>
                SMART ATTENDANCE FOR A SMARTER CAMPUS
              </span>

              <h1>
                Attendance
                <br />
                Made <span>Simple.</span>
                <br />
                Made <span>Secure.</span>
              </h1>

              <p>
                QRatten is a real-time QR-based attendance platform built
                to simplify attendance, reduce proxy attempts, and verify
                every attendance using time, location, and device validation.
              </p>

              <div className={styles.actions}>
                <Link href="/register" className={styles.primaryButton}>
                  Get Started
                  <span>→</span>
                </Link>

                <a
                  href="#how-it-works"
                  className={styles.secondaryButton}
                >
                  How It Works
                </a>
              </div>

              <div className="mt-8 flex items-start gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/10 text-left max-w-lg shadow-sm mr-auto ml-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    QRatten is currently in <span className="text-purple-600">Beta Version</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    We're actively improving the platform. Some features may change.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                PRODUCT PREVIEW
            ================================================== */}

            <div className={styles.productArea}>
              <div className={styles.productPreview}>
                <div className={styles.previewTopbar}>
                  <div className={styles.previewBrand}>
                    <QrCode size={17} />
                    <span>QRatten</span>
                  </div>

                  <div className={styles.previewStatus}>
                    <span />
                    Live Session
                  </div>
                </div>

                <div className={styles.previewBody}>
                  {/* Sidebar */}

                  <aside className={styles.previewSidebar}>
                    <div className={styles.sidebarActive}>
                      <Activity size={13} />
                      Dashboard
                    </div>

                    <div>
                      <QrCode size={13} />
                      Attendance
                    </div>

                    <div>
                      <Clock3 size={13} />
                      Sessions
                    </div>

                    <div>
                      <BarChart3 size={13} />
                      Analytics
                    </div>

                    <div>
                      <UserRound size={13} />
                      Students
                    </div>

                    <div>
                      <Settings size={13} />
                      Settings
                    </div>
                  </aside>

                  {/* Dashboard */}

                  <div className={styles.previewMain}>
                    <div className={styles.previewHeading}>
                      <div>
                        <div className={styles.liveTitle}>
                          Live Attendance
                        </div>

                        <div className={styles.sessionName}>
                          Database Management Systems
                        </div>

                        <div className={styles.sessionInfo}>
                          CSE-A&nbsp; | &nbsp;10:30 AM – 11:30 AM
                        </div>
                      </div>

                      <button className={styles.endButton}>
                        End Session
                      </button>
                    </div>

                    <div className={styles.previewGrid}>
                      {/* QR */}

                      <div className={styles.qrCard}>
                        <div className={styles.qrHeader}>
                          <span>Attendance QR</span>

                          <span className={styles.rotatingBadge}>
                            <Clock3 size={9} />
                            LIVE
                          </span>
                        </div>

                        <div className={styles.qrBox}>
                          <QrCode
                            size={125}
                            strokeWidth={1.8}
                          />

                          <div className={styles.qrRefresh}>
                            ↻
                          </div>
                        </div>

                        <div className={styles.qrTimer}>
                          <strong>00:03</strong>
                          <span>until next rotation</span>
                        </div>

                        <div className={styles.qrMessage}>
                          QR rotates every 5 seconds
                        </div>
                      </div>

                      {/* Stats */}

                      <div className={styles.previewStats}>
                        <div className={styles.statCards}>
                          <div className={styles.statCard}>
                            <span>Present</span>
                            <strong>47 / 52</strong>
                          </div>

                          <div className={styles.statCard}>
                            <span>Attendance</span>
                            <strong className={styles.green}>
                              90.4%
                            </strong>
                          </div>
                        </div>

                        {/* Location */}

                        <div className={styles.locationCard}>
                          <div className={styles.locationIcon}>
                            <MapPin size={13} />
                          </div>

                          <div>
                            <strong>Location Verified</strong>

                            <span>
                              CSE Block · Room 204
                            </span>

                            <small>
                              Radius: 50m
                            </small>
                          </div>

                          <Check size={14} />
                        </div>

                        {/* Recently marked */}

                        <div className={styles.recentCard}>
                          <div className={styles.recentHeader}>
                            <span>Recently Marked</span>

                            <small>View All</small>
                          </div>

                          {recentStudents.map(
                            ([initials, name, time]) => (
                              <div
                                className={styles.studentRow}
                                key={name}
                              >
                                <div className={styles.avatar}>
                                  {initials}
                                </div>

                                <span>{name}</span>

                                <time>{time}</time>

                                <Check
                                  size={10}
                                  className={styles.studentCheck}
                                />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security callouts */}

              <div className={styles.securityCallout}>
                <div className={styles.calloutIcon}>
                  <Clock3 size={18} />
                </div>

                <div>
                  <strong>Time-Based QR</strong>

                  <span>
                    QR code changes every 5 seconds
                  </span>
                </div>
              </div>

              <div className={styles.locationCallout}>
                <div className={styles.locationCalloutIcon}>
                  <MapPin size={18} />
                </div>

                <div>
                  <strong>Location Verified</strong>

                  <span>
                    Attendance valid within classroom area
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        <section id="features" className={styles.features}>
          <div className={styles.featuresInner}>
            {features.map(({ title, description, icon: Icon }, index) => (
              <div
                className={styles.featureWrapper}
                key={title}
              >
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <Icon size={23} />
                  </div>

                  <div>
                    <h3>{title}</h3>

                    <p>{description}</p>
                  </div>
                </div>

                {index !== features.length - 1 && (
                  <div className={styles.featureDivider} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}

        <section
          id="how-it-works"
          className={styles.howSection}
        >
          <span className={styles.sectionLabel}>
            HOW IT WORKS
          </span>

          <h2>
            Attendance without the <span>hassle.</span>
          </h2>

          <p className={styles.sectionDescription}>
            Teachers create a session, students scan the rotating
            QR from the permitted location, and attendance is
            verified instantly.
          </p>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>01</div>

              <div className={styles.stepIcon}>
                <QrCode size={24} />
              </div>

              <div>
                <h3>Create Session</h3>

                <p>
                  Teacher creates a session, sets the classroom
                  location and starts attendance.
                </p>
              </div>
            </div>

            <div className={styles.stepArrow}>→</div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>02</div>

              <div className={styles.stepIcon}>
                <Clock3 size={24} />
              </div>

              <div>
                <h3>Scan Time-Based QR</h3>

                <p>
                  Students scan the rotating QR before the
                  current token expires.
                </p>
              </div>
            </div>

            <div className={styles.stepArrow}>→</div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>03</div>

              <div className={styles.stepIcon}>
                <ShieldCheck size={24} />
              </div>

              <div>
                <h3>Get Verified</h3>

                <p>
                  QR, identity, device and location are checked
                  before attendance is recorded.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECURITY SECTION
        ====================================================== */}

        <section className={styles.securitySection}>
          <div className={styles.securityInner}>
            <div className={styles.securityText}>
              <span className={styles.sectionLabel}>
                MULTI-LAYER VERIFICATION
              </span>

              <h2>
                More than just
                <br />
                scanning a QR.
              </h2>

              <p>
                QRatten combines multiple verification layers to
                make attendance harder to manipulate while keeping
                the process simple for students and teachers.
              </p>
            </div>

            <div className={styles.securityGrid}>
              <div className={styles.securityCard}>
                <div className={styles.securityCardIcon}>
                  <Clock3 size={21} />
                </div>

                <h3>Time-Based QR</h3>

                <p>
                  Every attendance session uses a QR token that
                  automatically rotates every 5 seconds.
                </p>
              </div>

              <div className={styles.securityCard}>
                <div className={styles.securityCardIcon}>
                  <MapPin size={21} />
                </div>

                <h3>Location Verification</h3>

                <p>
                  Attendance is accepted only when the student is
                  within the configured classroom radius.
                </p>
              </div>

              <div className={styles.securityCard}>
                <div className={styles.securityCardIcon}>
                  <ShieldCheck size={21} />
                </div>

                <h3>Device Verification</h3>

                <p>
                  Registered device validation adds another layer
                  of protection against proxy attendance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ROLES
        ====================================================== */}

        <section id="roles" className={styles.roles}>
          <span className={styles.sectionLabel}>
            BUILT FOR EVERY STAKEHOLDER
          </span>

          <h2>
            One Platform.{' '}
            <span>Three Powerful Roles.</span>
          </h2>

          <p className={styles.sectionDescription}>
            Purpose-built experiences for students, teachers and
            administrators.
          </p>

          <div className={styles.roleGrid}>
            {roles.map(
              ({
                title,
                subtitle,
                icon: Icon,
                className,
                features: roleFeatures,
              }) => (
                <div
                  key={title}
                  className={`${styles.roleCard} ${className}`}
                >
                  <div className={styles.roleHeader}>
                    <div className={styles.roleIcon}>
                      <Icon size={26} />
                    </div>

                    <div>
                      <h3>{title}</h3>

                      <p>{subtitle}</p>
                    </div>
                  </div>

                  <ul>
                    {roleFeatures.map((feature) => (
                      <li key={feature}>
                        <span className={styles.checkIcon}>
                          <Check size={11} strokeWidth={3} />
                        </span>

                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={styles.learnMore}
                  >
                    Learn More
                    <span>→</span>
                  </Link>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =====================================================
            CTA
        ====================================================== */}

        <section className={styles.cta}>
          <div className={styles.ctaBackground} />

          <div className={styles.ctaInner}>
            <div className={styles.ctaIntro}>
              <span>
                SMARTER ATTENDANCE
              </span>

              <span>
                STARTS HERE
              </span>
            </div>

            <div className={styles.ctaContent}>
              <h2>
                Ready to bring QRatten
                <br />
                to your campus?
              </h2>

              <p>
                Replace manual attendance with a faster,
                location-aware and time-secured digital workflow.
              </p>

              <div className={styles.ctaActions}>
                <Link
                  href="/register"
                  className={styles.ctaPrimary}
                >
                  Get Started
                  <span>→</span>
                </Link>

                <a
                  href="mailto:your-email@example.com"
                  className={styles.ctaSecondary}
                >
                  Contact Us
                </a>
              </div>
            </div>

            <div className={styles.ctaStats}>
              <div>
                <Clock3 size={17} />

                <strong>5 sec</strong>

                <span>QR rotation</span>
              </div>

              <div>
                <MapPin size={17} />

                <strong>Location</strong>

                <span>Verified attendance</span>
              </div>

              <div>
                <ShieldCheck size={17} />

                <strong>Secure</strong>

                <span>Multi-layer checks</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link
            href="/"
            className={styles.footerBrand}
          >
            <span className={styles.footerLogo}>
              <QrCode size={18} />
            </span>

            QRatten
          </Link>

          <nav className={styles.footerLinks}>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#roles">Roles</a>
            <a href="#about">About</a>
          </nav>

          <div className={styles.footerSocials}>
            <a href="#">GitHub</a>
            <a href="#">LinkedIn</a>

            <a href="mailto:your-email@example.com">
              Email
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © 2026 QRatten. All rights reserved.
          </span>

          <span>
            Built and developed by{' '}
            <strong>Karthik Ethamukkala</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}