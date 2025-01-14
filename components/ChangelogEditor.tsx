import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ChangelogEditorProps {
  onClose: () => void
  onSave: () => void
}

export default function ChangelogEditor({ onClose, onSave }: ChangelogEditorProps) {
  const [version, setVersion] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [changes, setChanges] = useState([''])
  const supabase = createClientComponentClient()

  const handleAddChange = () => {
    setChanges([...changes, ''])
  }

  const handleChangeUpdate = (index: number, value: string) => {
    const newChanges = [...changes]
    newChanges[index] = value
    setChanges(newChanges)
  }

  const handleRemoveChange = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const filteredChanges = changes.filter(change => change.trim() !== '')
    if (filteredChanges.length === 0) {
      alert('Please add at least one change')
      return
    }

    try {
      const { data, error } = await supabase
        .from('changelogs')
        .insert({
          version,
          title,
          description,
          changes: filteredChanges,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('No data returned from insert')
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving changelog:', error)
      alert(error instanceof Error ? error.message : 'Failed to save changelog')
    }
  }

  return (
    <div className="bg-[#1A1B1E] rounded-xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold mb-6">Add Changelog Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Version</label>
          <input
            type="text"
            value={version}
            onChange={e => setVersion(e.target.value)}
            className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm"
            placeholder="1.0.0"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm"
            placeholder="Major Update"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm"
            placeholder="Brief description of the update"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Changes</label>
          <div className="space-y-2">
            {changes.map((change, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={change}
                  onChange={e => handleChangeUpdate(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/30 rounded-lg text-sm"
                  placeholder="Added new feature..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveChange(index)}
                  className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddChange}
            className="mt-2 text-sm text-purple-400 hover:text-purple-300"
          >
            + Add another change
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm hover:bg-white/5 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-sm rounded-lg hover:bg-purple-700"
          >
            Save Changelog
          </button>
        </div>
      </form>
    </div>
  )
} 