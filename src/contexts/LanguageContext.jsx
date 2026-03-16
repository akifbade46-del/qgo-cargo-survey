import { createContext, useContext, useState, useEffect } from 'react'
import { getDirection } from '@/utils/i18n'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get saved language or detect from browser
    const saved = localStorage.getItem('qgo-language')
    if (saved) return saved

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage
    return browserLang?.startsWith('ar') ? 'ar' : 'en'
  })

  const [direction, setDirection] = useState(getDirection(language))

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('qgo-language', language)

    // Update direction
    setDirection(getDirection(language))

    // Update HTML dir attribute
    document.documentElement.dir = direction
    document.documentElement.lang = language

    // Update font for Arabic
    if (language === 'ar') {
      document.body.classList.add('font-arabic')
    } else {
      document.body.classList.remove('font-arabic')
    }
  }, [language])

  const t = (key) => {
    return translations[key]?.[language] || key
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Translation dictionary
const translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.surveys': { en: 'Surveys', ar: 'الاستبيانات' },
  'nav.surveyors': { en: 'Surveyors', ar: 'المساحون' },
  'nav.items': { en: 'Item Library', ar: 'مكتبة العناصر' },
  'nav.pricing': { en: 'Pricing', ar: 'التسعير' },
  'nav.analytics': { en: 'Analytics', ar: 'التحليلات' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات' },

  // Common
  'common.save': { en: 'Save', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.delete': { en: 'Delete', ar: 'حذف' },
  'common.edit': { en: 'Edit', ar: 'تعديل' },
  'common.add': { en: 'Add', ar: 'إضافة' },
  'common.search': { en: 'Search', ar: 'بحث' },
  'common.filter': { en: 'Filter', ar: 'تصفية' },
  'common.export': { en: 'Export', ar: 'تصدير' },
  'common.print': { en: 'Print', ar: 'طباعة' },
  'common.close': { en: 'Close', ar: 'إغلاق' },
  'common.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
  'common.noData': { en: 'No data available', ar: 'لا توجد بيانات' },
  'common.total': { en: 'Total', ar: 'المجموع' },
  'common.status': { en: 'Status', ar: 'الحالة' },
  'common.actions': { en: 'Actions', ar: 'الإجراءات' },
  'common.view': { en: 'View', ar: 'عرض' },
  'common.download': { en: 'Download', ar: 'تحميل' },
  'common.upload': { en: 'Upload', ar: 'رفع' },

  // Survey
  'survey.title': { en: 'Cargo Survey', ar: 'استبيان البضائع' },
  'survey.reference': { en: 'Reference Number', ar: 'رقم المرجع' },
  'survey.customer': { en: 'Customer', ar: 'العميل' },
  'survey.from': { en: 'From', ar: 'من' },
  'survey.to': { en: 'To', ar: 'إلى' },
  'survey.date': { en: 'Survey Date', ar: 'تاريخ الاستبيان' },
  'survey.status': { en: 'Status', ar: 'الحالة' },

  // Status
  'status.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  'status.assigned': { en: 'Assigned', ar: 'تم التعيين' },
  'status.in_progress': { en: 'In Progress', ar: 'قيد التنفيذ' },
  'status.surveyed': { en: 'Surveyed', ar: 'تم المسح' },
  'status.completed': { en: 'Completed', ar: 'مكتمل' },
  'status.cancelled': { en: 'Cancelled', ar: 'ملغي' },

  // Container
  'container.type': { en: 'Container Type', ar: 'نوع الحاوية' },
  'container.recommendation': { en: 'Recommended Container', ar: 'الحاوية الموصى بها' },
  'container.20ft': { en: '20ft Standard', ar: '20 قدم قياسي' },
  'container.40ft': { en: '40ft Standard', ar: '40 قدم قياسي' },
  'container.lcl': { en: 'LCL', ar: 'أقل من حاوية' },

  // Rooms
  'room.living': { en: 'Living Room', ar: 'غرفة المعيشة' },
  'room.bedroom': { en: 'Bedroom', ar: 'غرفة النوم' },
  'room.kitchen': { en: 'Kitchen', ar: 'المطبخ' },
  'room.bathroom': { en: 'Bathroom', ar: 'الحمام' },
  'room.dining': { en: 'Dining Room', ar: 'غرفة الطعام' },

  // Actions
  'action.assign': { en: 'Assign Surveyor', ar: 'تعيين مساح' },
  'action.complete': { en: 'Complete Survey', ar: 'إكمال المسح' },
  'action.generate': { en: 'Generate Quote', ar: 'إنشاء عرض سعر' },
  'action.send': { en: 'Send', ar: 'إرسال' },

  // Validation
  'validation.required': { en: 'This field is required', ar: 'هذا الحقل مطلوب' },
  'validation.email': { en: 'Please enter a valid email', ar: 'الرجاء إدخال بريد إلكتروني صحيح' },
  'validation.phone': { en: 'Please enter a valid phone number', ar: 'الرجاء إدخال رقم هاتف صحيح' },

  // Messages
  'message.saved': { en: 'Saved successfully!', ar: 'تم الحفظ بنجاح!' },
  'message.deleted': { en: 'Deleted successfully!', ar: 'تم الحذف بنجاح!' },
  'message.error': { en: 'Something went wrong', ar: 'حدث خطأ ما' },
  'message.noResults': { en: 'No results found', ar: 'لم يتم العثور على نتائج' },
}
