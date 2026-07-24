import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ProgressDots } from '@/components/ui/ProgressDots'
import type { Equipment, ExperienceLevel, Goal } from '@/types'
import { NameGoalStep } from './NameGoalStep'
import { EquipmentStep } from './EquipmentStep'
import { InjuriesStep } from './InjuriesStep'
import { ExperienceStep } from './ExperienceStep'
import { ConfirmationStep } from './ConfirmationStep'

const STEP_COUNT = 5

interface Draft {
  name: string
  goal: Goal | null
  equipment: Equipment[]
  injuries: string
  experience: ExperienceLevel | null
}

const initialDraft: Draft = {
  name: '',
  goal: null,
  equipment: ['none'],
  injuries: '',
  experience: null,
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const setProfile = useAppStore((s) => s.setProfile)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [draft, setDraft] = useState<Draft>(initialDraft)

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const toggleEquipment = (item: Equipment) => {
    setDraft((d) => {
      if (item === 'none') return { ...d, equipment: ['none'] }
      const withoutNone = d.equipment.filter((e) => e !== 'none')
      const has = withoutNone.includes(item)
      const next = has ? withoutNone.filter((e) => e !== item) : [...withoutNone, item]
      return { ...d, equipment: next.length > 0 ? next : ['none'] }
    })
  }

  const handleConfirm = () => {
    if (!draft.goal || !draft.experience) return
    setProfile({
      name: draft.name.trim(),
      goal: draft.goal,
      equipment: draft.equipment,
      injuries: draft.injuries.trim(),
      experience: draft.experience,
      onboarded: true,
    })
    navigate('/home')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-10 p-6">
      <ProgressDots total={STEP_COUNT} current={step} />

      <div className="relative flex-1 overflow-hidden">
        {/*
          Deliberately no mode="wait" here: that gates mounting the next step
          on the previous step's exit animation fully resolving, which means
          any stall in that animation (backgrounded tab, slow device, a
          framer-motion hiccup) leaves the user permanently stuck with a
          dead Continue button. Absolute-positioning both steps during the
          overlap avoids the layout jump that would otherwise cause instead.
        */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {step === 0 && (
              <NameGoalStep
                name={draft.name}
                goal={draft.goal}
                onChangeName={(name) => setDraft((d) => ({ ...d, name }))}
                onChangeGoal={(goal) => setDraft((d) => ({ ...d, goal }))}
                onNext={goNext}
              />
            )}
            {step === 1 && (
              <EquipmentStep
                equipment={draft.equipment}
                onToggle={toggleEquipment}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 2 && (
              <InjuriesStep
                injuries={draft.injuries}
                onChange={(injuries) => setDraft((d) => ({ ...d, injuries }))}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 3 && (
              <ExperienceStep
                experience={draft.experience}
                onChange={(experience) => setDraft((d) => ({ ...d, experience }))}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 4 && draft.goal && draft.experience && (
              <ConfirmationStep
                name={draft.name}
                goal={draft.goal}
                equipment={draft.equipment}
                injuries={draft.injuries}
                experience={draft.experience}
                onConfirm={handleConfirm}
                onBack={goBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
