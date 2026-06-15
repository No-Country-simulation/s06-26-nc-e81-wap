import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CourseCard } from './CourseCard';
import type { Course } from '../types/training.types';
import './CourseCatalog.css';

export const CourseCatalog: React.FC = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>(t('training.filters.all'));

  const filters: string[] = [
    t('training.filters.all'),
    t('training.filters.backend'),
    t('training.filters.devops'),
    t('training.filters.architecture'),
  ];

  const courses: Course[] = [
    {
      id: 1,
      title: t('training.courses.infrastructure.title'),
      description: t('training.courses.infrastructure.description'),
      tag: t('training.courses.infrastructure.tag'),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7BMOAEs3he47CVemKqVIsvJyhHTOmykM1v3AoC3lGBlPWHHQNfOf8NEO3mPn6QFjwqdQMY_pZsZunZH3NZGbU32ZwJPrf49IkECDGXcJbxrncimczLrXw8ULjFMZqgENBPAYO1ichHhGJRYqmX02OuriSbcHVz3djWZwMBf0ZNxBmJZljyTLfeBP8nkIU8Rj0Likt6R8QmS1SIOJkdAAUlWirtuokBMkM0nLC6cAGchAx2QrWWpjHJMT7WHvc00MlgOrtse8s1pcx',
      duration: '24h content',
      hasInstructors: true,
    },
    {
      id: 2,
      title: t('training.courses.concurrency.title'),
      description: t('training.courses.concurrency.description'),
      tag: t('training.courses.concurrency.tag'),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrvCwtmNNS6ilKcbxlTkv9ddgQRZMRhIVg2WFenrTpycRd_NY7ubgYoPtaimn8oCJWjWjS_hWdLWtirMP_nOAcyOB8uCaSFemHnM9sh6R6_FfH9vDFBDOqxubdM_nILRqgo3h8mpmoVuStTn2LHGo2h3j_UIV2sBMWR2KWM2dRx42Dq4Hp58OCvIZHllRgXspAEMurUPk_mPwYOOJlgLnSmUBV6vNnv9a9ac7QBsynpNt_jeViU8Iyi8nzwkxNMdfonmu2MaPM_LPQ',
      duration: '12h content',
      beginnerFriendly: true,
    },
    {
      id: 3,
      title: t('training.courses.defensive.title'),
      description: t('training.courses.defensive.description'),
      tag: t('training.courses.defensive.tag'),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5k0wN-FgL-1YkvBuUkwdpKVKImqh6hJJWUWYd6JonvNHZ4UigbqyoetOuAsqurpgUJpH3UQrTTRP7FyoKZ8cYiphpycSz-xx4XmMTj5_b4YAFZA1kfrTVzBabzoI7SCKI6kCRGPBrHMQfzIWHqi-ZowzZ7_emb_yqdSEfFY-lDtLnvpBJCuCPJ4YHhCEZQHjHStzsuStMt3bZ1zSzuy5Jf8ahgZTzalybkuDCVp95xI3S2adlycCKJfDWUTwZh4Tku_NXi0x8vCxm',
      duration: '18h content',
      rating: 4,
    },
  ];

  return (
    <div className="catalog-section">
      <div className="catalog-header">
        <div>
          <h3 className="catalog-title">{t('training.catalogTitle')}</h3>
          <p className="catalog-subtitle">{t('training.catalogSubtitle')}</p>
        </div>
        <div className="filter-group">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="courses-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};