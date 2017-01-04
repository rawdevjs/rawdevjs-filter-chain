'use strict'

class FilterChain {
  constructor (filters) {
    this.filters = filters
    this.cache = []
    this.active = false

    this.filters.forEach((filter, index) => {
      filter.dirty = 'dirty' in filter ? filter.dirty : true
    })

    this.clear()
  }

  clear () {
    this.filters.forEach((filter, index) => {
      this.cache[index] = null
    })
  }

  process (image) {
    let index = 0

    // find first filter with dirty flag
    while (index < this.filters.length && !this.filters[index].dirty) {
      index++
    }

    // search for first result
    while (index >= 0 && !this.cache[index - 1]) {
      index--
    }

    if (index > 0) {
      image = this.cache[index - 1]
    } else {
      index++
    }

    let processFilter = (lastImage) => {
      console.log('process image using: ' + this.filters[index].label)

      return this.filters[index].process(lastImage).then((newImage) => {
        if (!this.filters[index].inPlace) {
          this.cache[index] = newImage
        } else if (index > 0) {
          this.cache[index - 1] = null
        }

        this.filters[index].dirty = false
        index++

        return newImage
      })
    }

    let next = (lastImage) => {
      return processFilter(lastImage).then((newImage) => {
        if (index === this.filters.length) {
          return newImage
        } else {
          return next(newImage)
        }
      })
    }

    return next(image)
  }
}

module.exports = FilterChain
