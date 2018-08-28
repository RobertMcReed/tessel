'use strict';

const tessel = require('tessel');
const { encode } = require('morjs')

const wait = ms => () =>
  new Promise(resolve => {
    setTimeout(() => resolve(true), ms);
  })

const pauseFor = secondScale => ({
  one: wait(secondScale),
  three: wait(secondScale * 3),
  seven: wait(secondScale * 7),
})

const {
  one,
  three,
  seven,
} = pauseFor(150)

const getLetters = phrase => (
  phrase
    .split(' ')
    .map(word => word.split(''))
)

const getMorseParts = phrase => (
  encode(phrase)
    .split('  ')
    .map(word => word.split(' ').filter(_ => _))
    .map(word => word.map(letter => letter.split('')))
)

const prepMorse = phrase => ({
  letters: getLetters(phrase),
  parts: getMorseParts(phrase),
  encoded: encode(phrase),
})

const morse = async (phrase) => {
  const { parts, letters, encoded } = prepMorse(phrase)

  for (let i = 0; i < parts.length; i++) {
    const word = parts[i]

    console.log('[Start Word]', letters[i].join(''))

    for (let j = 0; j < word.length; j++) {
      const letter = word[j]
      console.log('[Start Letter]', letters[i][j])

      for (let k = 0; k < letter.length; k++) {
        const part = letter[k]
        console.log('[Part]', part)
        console.log('[ON]')
        tessel.led[2].on()

        if (part === '.') await one()
        else await three()
        console.log('[OFF]')
        tessel.led[2].off()

        // pause for one beat after each part except the last
        if (k !== letter.length - 1) await one()
      }

      // pause for 3 beats after each letter except the last
      if (j !== word.length - 1) await three()
    }

    // pause for 7 beats after each word except the last
    if (i !== parts.length - 1) await seven()
  }

  console.log(phrase)
  console.log(encoded)
}

const phrase = 'hello world'
morse(phrase)
