import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Star, CheckCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const FEEDBACK_TAGS = [
  'Professional', 'On-time', 'Careful', 'Friendly',
  'Efficient', 'Organized', 'Helpful', 'Recommended'
]

export default function CustomerFeedback() {
  const { surveyId } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [survey, setSurvey] = useState(null)
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState([])
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSurvey()
  }, [surveyId])

  async function loadSurvey() {
    const { data } = await supabase
      .from('survey_requests')
      .select('id, reference_number, customer_name')
      .eq('id', surveyId)
      .single()

    if (data) {
      setSurvey(data)
      const { data: existing } = await supabase
        .from('feedback')
        .select('id')
        .eq('survey_request_id', surveyId)
        .single()

      if (existing) {
        setSubmitted(true)
      }
    }
    setLoading(false)
  }

  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const submitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('feedback')
      .insert([{
        survey_request_id: surveyId,
        rating,
        tags,
        comment,
        would_recommend: wouldRecommend
      }])

    if (!error) {
      setSubmitted(true)
      toast.success('Thank you for your feedback!')
    } else {
      toast.error('Failed to submit feedback')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-500">Your feedback has been submitted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-xl font-bold text-gray-900">Rate Your Experience</h1>
          {survey && (
            <p className="text-gray-500">Survey #{survey.reference_number}</p>
          )}
        </div>

        {/* Rating */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-center text-gray-600 mb-4">How was our service?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-2 hover:scale-110 transition-transform"
              >
                <Star
                  size={32}
                  className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-gray-600 mb-3">What did you like?</p>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tags.includes(tag)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-gray-600 mb-3">Additional comments (optional)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your experience..."
            className="w-full p-3 rounded-xl border border-gray-200 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Recommend */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <p className="text-gray-600 mb-3">Would you recommend us?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setWouldRecommend(true)}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                wouldRecommend === true
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setWouldRecommend(false)}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                wouldRecommend === false
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={submitFeedback}
          disabled={saving || rating === 0}
          className="w-full py-4 rounded-2xl bg-green-600 text-white font-semibold
                   flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
          {saving ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  )
}
