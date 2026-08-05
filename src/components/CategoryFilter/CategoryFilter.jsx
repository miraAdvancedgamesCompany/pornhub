import { useTranslation } from 'react-i18next'
import { useCategories } from '../../hooks/useCategories'
import './CategoryFilter.css'

export default function CategoryFilter({ selectedCategory, onSelect }) {
  const { t, i18n } = useTranslation()
  const { categories } = useCategories()
  const isAr = i18n.language === 'ar'

  return (
    <div className="category-filter" id="category-filter">
      <button
        className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
      >
        {t('categories.all')}
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {isAr ? cat.name_ar : cat.name_en}
        </button>
      ))}
    </div>
  )
}
