// Chrome API mock for testing
global.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      onChanged: {
        addListener: vi.fn()
      }
    }
  }
}
