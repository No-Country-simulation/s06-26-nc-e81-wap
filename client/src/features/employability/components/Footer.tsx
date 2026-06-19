
import { useTranslation } from 'react-i18next';
import './Footer.css';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="employability-footer">
      <div className="footer-grid">
        <div>
          <h5 className="footer-title">{t('employability.footer.resources')}</h5>
          <ul className="footer-list">
            <li><a href="#">{t('employability.footer.jobBoard')}</a></li>
            <li><a href="#">{t('employability.footer.resumeTemplates')}</a></li>
            <li><a href="#">{t('employability.footer.mockInterviews')}</a></li>
          </ul>
        </div>
        <div>
          <h5 className="footer-title">{t('employability.footer.legal')}</h5>
          <ul className="footer-list">
            <li><a href="#">{t('employability.footer.privacyPolicy')}</a></li>
            <li><a href="#">{t('employability.footer.termsOfService')}</a></li>
            <li><a href="#">{t('employability.footer.cookiePolicy')}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">{t('employability.footer.copyright')}</p>
        <div className="footer-icons">
          <span className="material-symbols-outlined">language</span>
          <span className="material-symbols-outlined">share</span>
        </div>
      </div>
    </footer>
  );
}