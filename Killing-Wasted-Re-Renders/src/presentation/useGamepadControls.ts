import { useCallback, useEffect, useRef, useState } from 'react'

type GamepadControlsOptions = {
  onNext?: () => void
  onPrev?: () => void
  onToggleTimer?: () => void
  onResetTimer?: () => void
  onNextDay?: () => void
  onPrevDay?: () => void
}

type GamepadControlsState = {
  isConnected: boolean
  isActivated: boolean
  pulseHaptic: (intensity?: number, durationMs?: number) => Promise<boolean>
}

const BUTTON_A = 0
const BUTTON_B = 1
const BUTTON_LB = 4
const BUTTON_RB = 5
const BUTTON_START = 9
const BUTTON_DPAD_LEFT = 14
const BUTTON_DPAD_RIGHT = 15

function isButtonPressed(button: GamepadButton | undefined): boolean {
  if (!button) return false
  return button.pressed || button.value > 0.5
}

export function useGamepadControls(options: GamepadControlsOptions): GamepadControlsState {
  const optionsRef = useRef(options)
  const previousPressedRef = useRef<Record<number, boolean>>({})
  const activeGamepadIndexRef = useRef<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isActivated, setIsActivated] = useState(false)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    let frameId = 0

    const updateConnectionState = () => {
      const gamepads = navigator.getGamepads?.() ?? []
      const hasGamepad = gamepads.some((gamepad) => gamepad?.connected)
      setIsConnected(hasGamepad)
      if (!hasGamepad) {
        activeGamepadIndexRef.current = null
        previousPressedRef.current = {}
      }
    }

    const triggerIfPressed = (gamepad: Gamepad, buttonIndex: number, callback?: () => void) => {
      const pressed = isButtonPressed(gamepad.buttons[buttonIndex])
      const wasPressed = previousPressedRef.current[buttonIndex] ?? false

      if (pressed && !wasPressed) {
        callback?.()
      }

      previousPressedRef.current[buttonIndex] = pressed
      return pressed
    }

    const tick = () => {
      const gamepads = navigator.getGamepads?.() ?? []
      const gamepad = gamepads.find((candidate) => candidate?.connected) ?? null

      setIsConnected(Boolean(gamepad))

      if (!gamepad) {
        activeGamepadIndexRef.current = null
        previousPressedRef.current = {}
        frameId = window.requestAnimationFrame(tick)
        return
      }

      if (activeGamepadIndexRef.current !== gamepad.index) {
        activeGamepadIndexRef.current = gamepad.index
        previousPressedRef.current = {}
      }

      const anyPressed = gamepad.buttons.some(isButtonPressed)
      if (anyPressed) {
        setIsActivated(true)
      }

      triggerIfPressed(gamepad, BUTTON_RB, optionsRef.current.onNext)
      triggerIfPressed(gamepad, BUTTON_LB, optionsRef.current.onPrev)
      triggerIfPressed(gamepad, BUTTON_A, optionsRef.current.onToggleTimer)
      triggerIfPressed(gamepad, BUTTON_B, optionsRef.current.onResetTimer)
      triggerIfPressed(gamepad, BUTTON_DPAD_LEFT, optionsRef.current.onPrevDay)
      triggerIfPressed(gamepad, BUTTON_DPAD_RIGHT, optionsRef.current.onNextDay)
      triggerIfPressed(gamepad, BUTTON_START, optionsRef.current.onToggleTimer)

      frameId = window.requestAnimationFrame(tick)
    }

    const handleConnected = () => updateConnectionState()
    const handleDisconnected = () => updateConnectionState()

    updateConnectionState()
    frameId = window.requestAnimationFrame(tick)

    window.addEventListener('gamepadconnected', handleConnected)
    window.addEventListener('gamepaddisconnected', handleDisconnected)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('gamepadconnected', handleConnected)
      window.removeEventListener('gamepaddisconnected', handleDisconnected)
    }
  }, [])

  const pulseHaptic = useCallback(async (intensity = 0.75, durationMs = 140) => {
    const activeGamepadIndex = activeGamepadIndexRef.current
    if (activeGamepadIndex === null) return false

    const gamepad = navigator.getGamepads?.()[activeGamepadIndex] ?? null
    if (!gamepad) return false

    const vibrationActuator = (
      gamepad as Gamepad & {
        vibrationActuator?: {
          playEffect?: (
            type: 'dual-rumble',
            params: {
              startDelay: number
              duration: number
              weakMagnitude: number
              strongMagnitude: number
            },
          ) => Promise<unknown>
        }
      }
    ).vibrationActuator

    if (vibrationActuator?.playEffect) {
      await vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: durationMs,
        weakMagnitude: intensity,
        strongMagnitude: intensity,
      })
      return true
    }

    const hapticActuator = (
      gamepad as Gamepad & {
        hapticActuators?: Array<{ pulse?: (value: number, duration: number) => Promise<boolean> }>
      }
    ).hapticActuators?.[0]

    if (hapticActuator?.pulse) {
      return hapticActuator.pulse(intensity, durationMs)
    }

    return false
  }, [])

  return { isConnected, isActivated, pulseHaptic }
}
