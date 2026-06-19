import { useTranslation } from 'react-i18next';
import type { ResumeData, Application } from '../hooks/useEmployability';
import './ResumeAnalytics.css';

interface ResumeAnalyticsProps {
  resumeData: ResumeData;
  applications: Application[];
}

export function ResumeAnalytics({ resumeData, applications }: ResumeAnalyticsProps) {
  const { t } = useTranslation();

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'interview':
        return 'status-badge interview';
      case 'applied':
        return 'status-badge applied';
      case 'closed':
        return 'status-badge closed';
      default:
        return 'status-badge';
    }
  };

  return (
    <section className="analytics-section">
      <div className="analytics-main">
        <div className="analytics-header">
          <div>
            <h3 className="analytics-title">{t('employability.resume.title')}</h3>
            <p className="analytics-subtitle">{t('employability.resume.lastUpdated')}</p>
          </div>
          <button className="analytics-edit">
            <span className="material-symbols-outlined">edit</span>
            {t('employability.resume.edit')}
          </button>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card">
            <p className="analytics-card-label">{t('employability.resume.atsScore')}</p>
            <p className="analytics-card-value">{resumeData.atsScore}/100</p>
          </div>
          <div className="analytics-card">
            <p className="analytics-card-label">{t('employability.resume.readability')}</p>
            <p className="analytics-card-value">{resumeData.readability}</p>
          </div>
          <div className="analytics-card">
            <p className="analytics-card-label">{t('employability.resume.keywords')}</p>
            <p className="analytics-card-value">{resumeData.keywords} {t('employability.resume.match')}</p>
          </div>
          <div className="analytics-card">
            <p className="analytics-card-label">{t('employability.resume.impact')}</p>
            <p className="analytics-card-value">{resumeData.impact}</p>
          </div>
        </div>
        <div className="analytics-improvements">
          <h4 className="improvements-title">{t('employability.resume.criticalImprovements')}</h4>
          {resumeData.improvements.map((item) => (
            <div key={item.id} className={`improvement-item ${item.type}`}>
              <span className="material-symbols-outlined">
                {item.type === 'error' ? 'warning' : 'lightbulb'}
              </span>
              <div>
                <p className="improvement-label">{item.title}</p>
                <p className="improvement-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">{t('employability.liveTracking.title')}</h3>
        </div>
        <div className="applications-list">
          {applications.map((app) => (
            <div key={app.id} className="application-item">
              <div className="application-header">
                <div>
                  <p className="application-title">{app.title}</p>
                  <p className="application-company">{app.company}</p>
                </div>
                <span className={getStatusBadgeClass(app.status)}>
                  {t(`employability.liveTracking.status.${app.status}`)}
                </span>
              </div>
              <p className="application-date">{app.date}</p>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <button className="view-all-btn">{t('employability.liveTracking.viewAll')}</button>
        </div>
      </div>
    </section>
  );
}