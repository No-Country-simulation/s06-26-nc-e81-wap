// features/employability/hooks/useEmployability.ts
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface ResumeData {
  atsScore: number;
  readability: string;
  keywords: number;
  impact: string;
  improvements: {
    id: string;
    type: 'error' | 'info';
    title: string;
    description: string;
  }[];
}

export interface Application {
  id: string;
  title: string;
  company: string;
  status: 'interview' | 'applied' | 'closed';
  date: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  tag?: string;
  duration: string;
  level?: string;
  image: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  online: boolean;
}

interface UseEmployabilityReturn {
  readinessScore: number;
  profileStrength: number;
  resumeData: ResumeData;
  applications: Application[];
  trainings: Training[];
  mentors: Mentor[];
  isLoading: boolean;
}

export function useEmployability(): UseEmployabilityReturn {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Omit<UseEmployabilityReturn, 'isLoading'>>({
    readinessScore: 0,
    profileStrength: 0,
    resumeData: {
      atsScore: 0,
      readability: '',
      keywords: 0,
      impact: '',
      improvements: [],
    },
    applications: [],
    trainings: [],
    mentors: [],
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      setData({
        readinessScore: 84,
        profileStrength: 92,
        resumeData: {
          atsScore: 78,
          readability: t('employability.resume.high'),
          keywords: 12,
          impact: t('employability.resume.optimal'),
          improvements: [
            {
              id: '1',
              type: 'error',
              title: t('employability.resume.quantifyTitle'),
              description: t('employability.resume.quantifyDesc'),
            },
            {
              id: '2',
              type: 'info',
              title: t('employability.resume.missingSkillsTitle'),
              description: t('employability.resume.missingSkillsDesc'),
            },
          ],
        },
        applications: [
          {
            id: '1',
            title: t('employability.liveTracking.app1.title'),
            company: t('employability.liveTracking.app1.company'),
            status: 'interview',
            date: t('employability.liveTracking.app1.date'),
          },
          {
            id: '2',
            title: t('employability.liveTracking.app2.title'),
            company: t('employability.liveTracking.app2.company'),
            status: 'applied',
            date: t('employability.liveTracking.app2.date'),
          },
          {
            id: '3',
            title: t('employability.liveTracking.app3.title'),
            company: t('employability.liveTracking.app3.company'),
            status: 'closed',
            date: t('employability.liveTracking.app3.date'),
          },
        ],
        trainings: [
          {
            id: '1',
            title: t('employability.training.behavioral.title'),
            description: t('employability.training.behavioral.description'),
            tag: t('employability.training.behavioral.tag'),
            duration: t('employability.training.behavioral.duration'),
            level: t('employability.training.behavioral.level'),
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpxL7AxNp1rStRzqfL8g9nmM-34NM24567u2nTLwhIZ47meorCbxuitItymfdYgVUPWgrtc_B23qFJ0eXnWlcpTeAwd5CFaOA155T2mGxugN54ylGnloSWp6SBZOYCigaF6nmmICIE-Qo4ASM9klHOrltagQWKl675RYTa68IZ3bCHqndlJKcpDDzoETFa0Ltg3b5wM0-FIFGevXrqomUgxfydMITnjRJaiUK2D4WtoQZP4UslpuKmW4Lbcb1SMJ-D64nQOorWsIse',
          },
          {
            id: '2',
            title: t('employability.training.systemDesign.title'),
            description: t('employability.training.systemDesign.description'),
            duration: t('employability.training.systemDesign.duration'),
            level: t('employability.training.systemDesign.level'),
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB29LvZRqY4TXA61sv0zATVYEvN8eoLsgQxIrxl0JFBAW2Y54QkMyKohP2J652c_QIQy8rwiXDkd9GewLoSWCVITiP9y49XZVEJ-eQ2qKjfNwwuXp-xC6c4TXapJb6NsF65B7Lryf7k4uDH4WNlT29vj1tSA2artIqjS5R4LhPgu2r3gN4aoHASbOHainyRtSlTTPJSX8f3KTl631MoIvYYobnj2YuNkdZA3ID7FLcimc8TjvAtTrLyl4vuYuwhOZ2arKo4Mf_L-4Bf',
          },
          {
            id: '3',
            title: t('employability.training.frontend.title'),
            description: t('employability.training.frontend.description'),
            duration: t('employability.training.frontend.duration'),
            level: t('employability.training.frontend.level'),
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpfi-9zIKTla1trPicc65H2L408aqfKPrCRtFLIn5hyLjN0jc-pb7AxZjqTe8bURz1as87RrsUFKXPY08CC0RZitrSc9Mu7UZzA0LGib0lXOW6HAmUcv3Btvs9tx82RtDI8DSTesKVHm2U9Mc29DsxfWhbPC5bhhhBNcqoARB35v7L9PbZyOCOuIO1X-IUicha0DytjHHDofm_WjLGoekvFWRhx1I7Y6bRgWMLkqOrV4KORdDFHDOkU7NNjiZo8NAEY_D1MBhI1lNb',
          },
        ],
        mentors: [
          {
            id: '1',
            name: 'Sarah Chen',
            title: 'Senior Software Engineer',
            company: 'Google',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjRobcgpqdaqyMy49Hb8If4ih3lzuJdDJ7Ae-mVJ3nypZogzZ8w2AX05_HkVlf_r9KShMr2DX8n5NdELKCCDVOed9h7sWVNRLj4qmFx8Kpp3kajajxjNggxhTAulgoAkerUMeTa97sb-tgmX2jtcUvyx8G2lJ_iOriQum6WJqBN1W8BknHj8COuDIrTWYMNzb8QrrXqyVJSfg1Ihmllt6-DXMUfOE0Ubb46i_IbRTzhQo2rSg_F6wRg4nte0f9ujSX_JeiaqR3mqPi',
            online: true,
          },
          {
            id: '2',
            name: 'Michael Torres',
            title: 'Tech Lead',
            company: 'Microsoft',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBchtyW1TpQJi_Gw5ZkRYJ516hBkj8nkCMmGh7sncvaaJaoNmS06Zvm9O3CTBe_SgfeBophjRfoBSiZGZTye5vp2byT3CXc0zQBkw85v7iyy8B9yI3vT5hZVyJFZBvgbgMkGWklJ1JsYry0VUFWeTihX_kFFopYbGofG-92SUzLqVY0j6vAKhsCVSlNZL6KU0FQ5_PG8VoJZ_7NhSsyte8iicvInd9uHD3k2WNGivUetb_pylqcY6b9Pf8VjMRf12x6WwnUVqOFqkne',
            online: true,
          },
          {
            id: '3',
            name: 'Elena Rodriguez',
            title: 'Engineering Manager',
            company: 'Airbnb',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEasnlLhYzRib1Gp2OxT_yOelggxmzE4MT6dL4gaZgoHpPZG8Oe-xpzmZ_0A5jqWg5zRU3-kbxbGXWi0qDp12odtJZQZkcLm1JotQgrKNVgpxL9Zhhfppf57XEF-2yjlcMtxjLl4CuanOnKXhBMl390kmdI0A6s1Dq8ok8jTIYzTSSRNJ7c3Vspo730ZxHVDmAS--X5qZE8_vfmdEaSbdrX24Aojycqia4tkrDY48yYqIN8zFtvEBASQy-FjukSI4oulG6R8J52gbT',
            online: false,
          },
          {
            id: '4',
            name: 'David Kim',
            title: 'Staff Engineer',
            company: 'Stripe',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkun85rARa7DzX2Ia9ms2KQ-41RUP_OjQUBV5wdtRovWyN0myP4L7q96Jo27VhZB7ioq29xolOlBKmlltaaCIJWDBG9NJQ8UxiUlxmvMi2uIvsND0V6s2_aivweAfvdu61VLHJ20dGR95N0IzpPbyZNhvyGZ7G-6hs8nj_gh-I4zfCSVjp7Cy1gN7pI1ng3QNpjY39S3aPE0qgnw1aUgx4BW0A17iBrxaX-lfohp2eA6JWzg2Rfj_BNJOLr8VkvYiQAZjVq1UolHDp',
            online: true,
          },
        ],
      });
      setIsLoading(false);
    };

    loadData();
  }, [t]);

  return {
    ...data,
    isLoading,
  };
}