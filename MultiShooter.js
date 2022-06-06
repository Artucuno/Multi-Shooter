// https://github.com/Artucuno/Multi-Shooter

function getDirection (num: number) {
    for (let value of varList) {
        serial.writeLine("direction-" + value)
        if (num == parseFloat(value.split("|")[1])) {
            return parseFloat(value.split("-")[2])
        }
    }
    return 0
}
function getPositionY (num: number) {
    for (let value of varList) {
        serial.writeLine("Y axis-" + value)
        if (num == parseFloat(value.split("|")[1])) {
            return parseFloat(value.split("-")[1])
        }
    }
    return 0
}
input.onButtonPressed(Button.A, function () {
    player.move(1)
})
function setVars () {
    varList = []
    playerList = []
    spriteList = []
    player = game.createSprite(randint(0, 4), randint(0, 4))
    bulletPlayers = []
    bulletList = []
}
function setRadio () {
    radio.setGroup(1)
    radio.setTransmitPower(7)
    radio.setTransmitSerialNumber(true)
}
function shootBullet (num: number, direction: number) {
    if (num == control.deviceSerialNumber()) {
        radio.sendString("shootBullet")
    }
    if (num == control.deviceSerialNumber()) {
        bulletList.push(game.createSprite(player.get(LedSpriteProperty.X), player.get(LedSpriteProperty.Y)))
        bulletPlayers.push(num)
        bulletList[bulletList.length - 1].set(LedSpriteProperty.Direction, player.get(LedSpriteProperty.Direction))
    } else {
        bulletList.push(game.createSprite(getPositionX(num), getPositionY(num)))
        bulletPlayers.push(num)
        bulletList[bulletList.length - 1].set(LedSpriteProperty.Direction, getDirection(num))
    }
    m = bulletList[bulletList.length - 1]
    basic.pause(800)
    bulletPlayers.removeAt(bulletList.indexOf(m))
    bulletList.removeAt(bulletList.indexOf(m))
    m.delete()
}
function getPositionX (num: number) {
    for (let value of varList) {
        serial.writeLine("X axis-" + value)
        if (num == parseFloat(value.split("|")[1])) {
            return parseFloat(value.split("-")[0])
        }
    }
    return 0
}
input.onButtonPressed(Button.AB, function () {
    shootBullet(control.deviceSerialNumber(), 1)
})
radio.onReceivedString(function (receivedString) {
    if (receivedString == "hasDied") {
        spriteList[playerList.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber))].delete()
    }
    if (receivedString == "shootBullet") {
        shootBullet(radio.receivedPacket(RadioPacketProperty.SerialNumber), 0)
    }
    if (playerList.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber)) == -1) {
        playerList.push(radio.receivedPacket(RadioPacketProperty.SerialNumber))
        varList.push(receivedString)
        spriteList.push(game.createSprite(0, 0))
    } else {
        varList[playerList.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber))] = receivedString
        spriteList[playerList.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber))].set(LedSpriteProperty.X, parseFloat(receivedString.split("-")[0]))
        spriteList[playerList.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber))].set(LedSpriteProperty.Y, parseFloat(receivedString.split("-")[1]))
        spriteList[playerList.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber))].set(LedSpriteProperty.Direction, parseFloat(receivedString.split("-")[2]))
    }
})
input.onButtonPressed(Button.B, function () {
    player.turn(Direction.Right, 90)
})
let m: game.LedSprite = null
let bulletList: game.LedSprite[] = []
let bulletPlayers: number[] = []
let spriteList: game.LedSprite[] = []
let playerList: number[] = []
let player: game.LedSprite = null
let varList: string[] = []
setRadio()
setVars()
basic.forever(function () {
    radio.sendString("" + player.get(LedSpriteProperty.X) + "-" + player.get(LedSpriteProperty.Y) + "-" + player.get(LedSpriteProperty.Direction) + "|" + control.deviceSerialNumber())
    basic.pause(85)
})
basic.forever(function () {
    for (let value2 of bulletList) {
        value2.move(1)
        if (value2.isTouching(player)) {
            if (control.deviceSerialNumber() != bulletPlayers[bulletList.indexOf(value2)]) {
                radio.sendString("hasDied")
                game.gameOver()
            }
        }
        value2.ifOnEdgeBounce()
    }
    basic.pause(100)
})
