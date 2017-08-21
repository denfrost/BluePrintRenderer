class BinaryOperatorNode extends RegularNode {
    constructor(node, x, y, texturesHandler) {
        super(node, x, y, texturesHandler);
        this.showPinText = true;
        this.inputOffset = this.cellSize * 0.2;

        this.pinRows = [];


        this.titleHeight = 0;

        this.node = node;

        this.body = new PIXI.mesh.NineSlicePlane(texturesHandler.mathNodeBodyTexture, 11, 11, 11, 11);
        this.shadowSelected = new PIXI.mesh.NineSlicePlane(texturesHandler.mathNodeShadowSelectedTexture, 21, 21, 21, 21);
        this.config = {
            body: true,
            gloss: false,
            shadow: true,
            titleHighlight: false,
            colorSpill: false
        };
    }
    draw(nodesContainer) {
        super.draw(nodesContainer);
        this.pinStartY = -this.body.height / 2 + CONFIG.CELL_SIZE;

        var text = this.node.name;
        if (text.indexOf("Boolean") !== -1) {
            text = text.replace("Boolean", "").toUpperCase();
        } else if (text.indexOf("Int") !== -1 || text.indexOf("Float") !== -1 || text.indexOf("Enum") !== -1) {
            if (text.indexOf("And") !== -1) {
                text = "&";
            } else if (text.indexOf("Or") !== -1) {
                text = "|";
            } else if (text.indexOf("Multiply") !== -1) {
                text = "x";
            } else if (text.indexOf("Equality") !== -1) {
                text = "==";
            } else if (text.indexOf("Subtract") !== -1) {
                text = "-"
            } else if (text.indexOf("Add") !== -1) {
                text = "+"
            } else if (text.indexOf("Multiply") !== -1) {
                text = "x"
            } else if (text.indexOf("Percent") !== -1) {
                text = "%"
            } else if (text.indexOf("Divide") !== -1) {
                text = "/"
            } else if (text.indexOf("Dot") !== -1) {
                text = "."
            } else if (text.indexOf("Greater") !== -1) {
                if (text.indexOf("Equal") === -1)
                    text = ">"
                else
                    text = ">="
            } else if (text.indexOf("Less") !== -1) {
                if (text.indexOf("Equal") === -1)
                    text = "<"
                else
                    text = "<="
            } else if (text.indexOf("Equal") !== -1 && text.indexOf("Not") !== -1) {
                text = "!="
            } else if (text.indexOf("Equal") !== -1) {
                text = "="
            } else if (text.indexOf("Not") !== -1) {
                text = "NOT"
            }
        }

        this.operatorText = new PIXI.Text(text, binaryOperatorTextStyle);
        this.operatorText.anchor.set(0.5, 0.5);
        this.container.addChild(this.operatorText);
        super.drawPinRows();
    }
}

