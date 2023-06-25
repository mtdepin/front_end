import { Zip, ZipPassThrough } from 'fflate'
type params = {
    path: string,
    stream: ReadableStream
}
export default function getZipStream (files: params[]) {
  const zip = new Zip()
  let aborted = false
  let fileReader = null 
  let control = null
  const readableStream = new ReadableStream(
    {
      start (controller) {
        control = controller
        zip.ondata = (err, chunk, final) => {
          if (err) {
            aborted = true
            controller.error(err)
            fileReader?.cancel(err)
            return
          }
          controller.enqueue(chunk)
          if (final) {
            controller.close()
            return
          }
        }
      },
      cancel (reason) {
        aborted = true
        fileReader?.cancel(reason)
      }
    }
  )
  ;(async () => {
    for (const file of files) {
      if (aborted) {
        return
      }
      const { path, stream } = file
      const zipItem = new ZipPassThrough(path)
      zip.add(zipItem)
      const ondata = zipItem.ondata.bind(zipItem)
      zipItem.ondata = (err, chunk, final) => {
        ondata(err, chunk, final)
        if(err) {
            control?.error(err)
            aborted = true
        }
      }
      try {
        fileReader = stream.getReader()
        let isDone = false
        while (!isDone) {
          const { done, value } = await fileReader.read()
          const chunk = done ? new Uint8Array(0) : value
          isDone = done
          zipItem.push(chunk, done)
        }
      } catch (err) {
        control?.error(err)
      }
    }
    zip.end()
  })()
  return readableStream
}
