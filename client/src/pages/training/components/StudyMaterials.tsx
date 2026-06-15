import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StudyMaterial, Workshop } from '../types/training.types';
import './StudyMaterials.css';

export const StudyMaterials: React.FC = () => {
  const { t } = useTranslation();

  const materials: StudyMaterial[] = [
    { id: 1, icon: 'description', title: t('training.materials.guide'), size: t('training.materials.guideSize') },
    { id: 2, icon: 'folder_zip', title: t('training.materials.exercises'), size: t('training.materials.exercisesSize') },
    { id: 3, icon: 'movie', title: t('training.materials.video'), size: t('training.materials.videoSize') },
  ];

  const workshops: Workshop[] = [
    {
      id: 1,
      title: t('training.workshops.database.title'),
      description: t('training.workshops.database.description'),
      time: t('training.workshops.database.time'),
      isUpcoming: true,
      attendeeCount: 42,
    },
    {
      id: 2,
      title: t('training.workshops.networking.title'),
      description: t('training.workshops.networking.description'),
      time: t('training.workshops.networking.time'),
      isUpcoming: false,
    },
  ];

  return (
    <section className="study-section">
      <div className="materials-column">
        <h3 className="section-title">{t('training.studyMaterials')}</h3>
        <div className="materials-list">
          {materials.map((material) => (
            <div key={material.id} className="material-item group">
              <div className="material-info">
                <div className="material-icon">
                  <span className="material-symbols-outlined">{material.icon}</span>
                </div>
                <div>
                  <p className="material-title">{material.title}</p>
                  <p className="material-size">{material.size}</p>
                </div>
              </div>
              <span className="material-symbols-outlined download-icon">download</span>
            </div>
          ))}
        </div>
      </div>

      <div className="workshops-column">
        <h3 className="section-title">{t('training.upcomingWorkshops')}</h3>
        <div className="workshops-card">
          <div className="timeline">
            {workshops.map((workshop) => (
              <div key={workshop.id} className={`timeline-item ${!workshop.isUpcoming ? 'inactive' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <p className="workshop-time">{workshop.time}</p>
                  <h4 className="workshop-title">{workshop.title}</h4>
                  <p className="workshop-description">{workshop.description}</p>
                  {workshop.isUpcoming && (
                    <div className="workshop-attendees">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS-WYSfmzXkaX0Bi-4NtBlhoLe6K9vh2bQCO_O2-0qLnccFWjUj2l-WgQC-slae4R4fNRrz5NVO6RcZEmO_oRedLG3qpncNSOyLttmijtanPvCSUsNA6SSlIun93n0ZiiA_puyToSK2fYfUz6bKR6U0UyOQCp93gNFCFpUxa3SU4orVH6ND-PYq_tu0aQGpyMiEoe7MPmWEQ-J3lWmfp3QEqRzVt8D0O4Fu4R4yFC54YjAEW8dbc7uoL1O_ERz2nTg67FAAhVooMP3"
                        alt="Speaker"
                        className="speaker-avatar"
                      />
                      <span className="attendees-text">{t('training.workshops.attendees', { count: workshop.attendeeCount })}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn">{t('training.viewAllEvents')}</button>
        </div>
      </div>
    </section>
  );
};