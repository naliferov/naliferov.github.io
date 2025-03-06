export const walkIn4Directions = (point, p5) => {

    const choice = p5.floor(p5.random(4))
    if (choice === 0) {
      point.x++
    } else if (choice === 1) {
      point.x--
    } else if (choice === 2) {
      point.y++
    } else {
      point.y--
    }
}
const walkerIn8Directions = (point, p5) => {
    let xstep = p5.floor(p5.random(3)) - 1
    let ystep = p5.floor(p5.random(3)) - 1

    point.x += xstep;
    point.y += ystep;
}

class Point {
    constructor() {
      this.x = 125
      this.y = 125
    }
}

//const { Point, walkIn4Directions, walkerIn8Directions } = await import('./module/random.js')

  let project = document.getElementById('random-walk-points-4-redirections')
  let container = project.getElementsByClassName('container')[0]

  const space = { x: 250, y: 250 }
  const point = new Point
  const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(space.x, space.y)
      p5.background('lightgray')
      p5.stroke(0)
      p5.strokeWeight(2)
    }
    p5.frameRate(10)
    p5.draw = () => {
      point.randomMove4Directions(p)
      p.point(point.x, point.y)
    }
  }
  new p5(sketch, container)



  // let project = document.getElementById('random-uniform-probability')
  //   let container = project.getElementsByClassName('container')[0]
  //   const space = { x: 640, y: 240 }
  //   const point = new Point

  //create div with title and desc

  //looking as setup
  //   let randomCounts = []
  //   let total = 20
  //   for (let i = 0; i < total; i++) {
  //     randomCounts[i] = 0
  //   }
  //   let w = space.x / randomCounts.length

  //   const sketch = (p) => {
  //     p.setup = () => {
  //       p.createCanvas(space.x, space.y)
  //       p.background('lightgray')
  //       p.stroke(0)
  //       p.fill(150)
  //     }
  //     p.frameRate(25)
  //     p.draw = () => {
  //       let index = p.floor(p.random(randomCounts.length))
  //       randomCounts[index]++
  //       for (let x = 0; x < randomCounts.length; x++) {
  //         p.rect(x * w, space.y - randomCounts[x], w - 1, randomCounts[x])
  //       }
  //     }
  //   }
  //   new p5(sketch, container)
  // })()
  //all same but
  //point.randomMove8Directions(p)


