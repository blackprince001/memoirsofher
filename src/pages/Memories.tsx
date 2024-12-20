import MemoriesForm from '@/components/memories/memoriesform'

export default function Memories() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white text-black p-6 md:p-10">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            
          </div>
          Acme Inc.
        </a>
     <MemoriesForm/>
      </div>
    </div>
  )
}
