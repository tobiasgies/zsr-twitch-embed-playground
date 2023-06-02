
class CropBox {
    constructor(tlX, tlY, brX, brY) {
        this.tlX = (!!tlX) ? parseInt(tlX) : null;
        this.tlY = (!!tlY) ? parseInt(tlY) : null;
        this.brX = (!!brX) ? parseInt(brX) : null;
        this.brY = (!!brY) ? parseInt(brY) : null;
    }

    isComplete() {
        return (this.tlX === 0 || !!this.tlX) &&
            (this.tlY === 0 || !!this.tlY) &&
            (this.brX === 0 || !!this.brX) &&
            (this.brY === 0 || !!this.brY);
    }

    isSane() {
        return this.isComplete() &&
            this.tlX < this.brX &&
            this.tlY < this.brY;
    }
}

let maybeDisplayCropHighlight = function(cropBox, playerContainer, highlightElement) {
    console.log(`Crop Box: ${JSON.stringify(cropBox)}`);

    if (!playerContainer.isCropped && cropBox.isSane()) {
        highlightElement.style.top = cropBox.tlY.toString() + "px";
        highlightElement.style.left = cropBox.tlX.toString() + "px";
        highlightElement.style.height = (cropBox.brY - cropBox.tlY - 2).toString() + "px";
        highlightElement.style.width = (cropBox.brX - cropBox.tlX - 2).toString() + "px";
        highlightElement.style.display = "block";
    } else {
        highlightElement.style.display = "none";
    }
}

let uncrop = function(playerContainer, twitchPlayer) {
    twitchPlayer.style.top = "0px";
    twitchPlayer.style.left = "0px";
    twitchPlayer.style.scale = "none";
    playerContainer.isCropped = false;
}

let maybeCrop = function(cropBox, playerContainer, twitchPlayer) {
    const PLAYER_WIDTH = 1280;
    const PLAYER_HEIGHT = 720;

    if (playerContainer.isCropped) {
        console.error("Not cropping, player is already cropped. Uncrop first.");
        return;
    }

    if (!cropBox.isSane()) {
        console.error(`Not cropping, crop box is not sane (all values set and BR X/Y > TL X/Y): ${JSON.stringify(cropBox)}`);
        return;
    }

    let scaleX = PLAYER_WIDTH / (cropBox.brX - cropBox.tlX);
    let scaleY = PLAYER_HEIGHT / (cropBox.brY - cropBox.tlY);

    twitchPlayer.style.left = Math.round(cropBox.tlX * scaleX * -1).toString() + "px";
    twitchPlayer.style.top = Math.round(cropBox.tlY * scaleY * -1).toString() + "px";
    twitchPlayer.style.scale = `${scaleX} ${scaleY}`;

    playerContainer.isCropped = true;
}

document.createCropBox = function() {
    let tlXElement = this.getElementById("tl-x");
    let tlYElement = this.getElementById("tl-y");
    let brXElement = this.getElementById("br-x");
    let brYElement = this.getElementById("br-y");
    return new CropBox(tlXElement.value, tlYElement.value, brXElement.value, brYElement.value);
}

document.addEventListener("DOMContentLoaded", function() {
    let tlXElement = this.getElementById("tl-x");
    let tlYElement = this.getElementById("tl-y");
    let brXElement = this.getElementById("br-x");
    let brYElement = this.getElementById("br-y");
    let cropButton = this.getElementById("crop");
    let uncropButton = this.getElementById("uncrop");
    let playerContainer = this.getElementById("player-container");
    let twitchPlayer = this.getElementById("twitch-player");
    let highlightElement = this.getElementById("crop-highlight");

    playerContainer.isCropped = false;
    maybeDisplayCropHighlight(this.createCropBox(), playerContainer, highlightElement);

    tlXElement.addEventListener("change", () => maybeDisplayCropHighlight(document.createCropBox(), playerContainer, highlightElement));
    tlYElement.addEventListener("change", () => maybeDisplayCropHighlight(document.createCropBox(), playerContainer, highlightElement));
    brXElement.addEventListener("change", () => maybeDisplayCropHighlight(document.createCropBox(), playerContainer, highlightElement));
    brYElement.addEventListener("change", () => maybeDisplayCropHighlight(document.createCropBox(), playerContainer, highlightElement));
    cropButton.addEventListener("click", ev => {
        ev.preventDefault();
        let cropBox = document.createCropBox();
        maybeCrop(cropBox, playerContainer, twitchPlayer);
        maybeDisplayCropHighlight(cropBox, playerContainer, highlightElement);
    })
    uncropButton.addEventListener("click", ev => {
        ev.preventDefault();
        uncrop(playerContainer, twitchPlayer);
        maybeDisplayCropHighlight(document.createCropBox(), playerContainer, highlightElement);
    });
})