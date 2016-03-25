function BPToNodes(objects, origin) {
	var origin = origin || new Vector(0, 0);
	var minX, minY;
	var newNodes = [];
	minX = objects[0].nodePosX;
	minY = objects[0].nodePosY;

	for (var i = 0; i < objects.length; i++) {
		var curObj = objects[i];

		if (parseInt(curObj.nodePosX) < minX)
			minX = curObj.nodePosX;
		if (parseInt(curObj.nodePosY) < minY)
			minY = curObj.nodePosY;
	}

	for (var i = 0; i < objects.length; i++) {
		var curObj = objects[i];
		if (!curObj.nodePosY)
			curObj.nodePosY = 0;
		if (!curObj.nodePosX)
			curObj.nodePosX = 0;
		curObj.nodePosY -= minY;
		curObj.nodePosX -= minX;

		curObj.nodePosY += origin.y;
		curObj.nodePosX += origin.x;
	}

	var maxX = 0, maxY = 0;

	for (var i = 0; i < objects.length; i++) {
		var curObj = objects[i];

		if (curObj.nodePosY > maxY)
			maxY = curObj.nodePosY;

		if (curObj.nodePosX > maxX)
			maxX = curObj.nodePosX;
	}



	var links = [];
	for (var i = 0; i < objects.length; i++) {
		var curObj = objects[i];
		var x, y;
		var newNode;
		var nN;
		x = curObj.nodePosX;
		y = curObj.nodePosY;
		if (curObj.class && curObj.class.indexOf("EdGraphNode_Comment") !== -1) {
			newNode = {
				name: curObj.nodeComment,
				width: curObj.nodeWidth,
				height: curObj.nodeHeight
			};
			if(curObj.commentColor)
				newNode.commentColor = curObj.commentColor;
			nN = new CommentNode(newNode, x, y);
			newNodes.push(nN);
		}


	}


	for (var i = 0; i < objects.length; i++) {
		var curObj = objects[i];

		var inputs = [];
		var outputs = [];
		var x, y;
		var newNode;
		var nN;
		x = curObj.nodePosX;
		y = curObj.nodePosY;

		if (curObj.pins.length === 0) {
			//console.log('empty pins');
			continue
		}

		for (var j = 0; j < curObj.pins.length; j++) {
			var curPin = curObj.pins[j];
			var pinType = VAR_TYPES[curPin.pinSubType] && VAR_TYPES[curPin.pinSubType] || VAR_TYPES[curPin.pinType];
			if (curPin.bHidden === "True")
				continue;

			if (curPin.isOutput) {
				for (var k = 0; k < curPin.linkedTo.length; k++) {
					links.push({from: curPin.pinId, to: curPin.linkedTo[k]})
				}
			}
			var newPin = {name: curPin.pinFriendlyName && curPin.pinFriendlyName || curPin.pinText, type: pinType, id: curPin.pinId};
			if (curPin.isArray)
				newPin.isArray = true;
			if (curPin.linkedTo.length > 0)
				newPin.linked = true;
			else
				newPin.linked = false;

			if (!newPin.linked && !curPin.isOutput) {
				if (newPin.type === VAR_TYPES["vector"] || newPin.type === VAR_TYPES["rotator"]) {
					var tmpValue = curPin.defaultValue && curPin.defaultValue || curPin.autogeneratedDefaultValue;
					var vect = tmpValue.split(",");
					for (var z = 0; z < vect.length; z++) {
						vect[z] = parseFloat(vect[z]).toFixed(1);
					}
					newPin.value = vect;
				}
				else if (newPin.type === VAR_TYPES["float"] || newPin.type === VAR_TYPES["int"] || newPin.type === VAR_TYPES["byte"]) {
					newPin.value = curPin.defaultValue && curPin.defaultValue || curPin.autogeneratedDefaultValue;
					//newPin.value = parseFloat(newPin.value).toFixed(1);
				}
				else if (newPin.type === VAR_TYPES["bool"]) {
					newPin.value = curPin.defaultValue && curPin.defaultValue || curPin.autogeneratedDefaultValue;
					if (newPin.value === "true")
						newPin.value = true;
					else
						newPin.value = false;
					//newPin.value = parseFloat(newPin.value).toFixed(1);
				}
				else if (newPin.type === VAR_TYPES["actor"] || newPin.type === VAR_TYPES["object"]) {
					if (curPin.pinText === "self") {
						newPin.value = "self";
					}
				}
			}

			if (curPin.isOutput) {
				outputs.push(newPin);
			}
			else {
				inputs.push(newPin);
			}
		}

		if (!curObj.class || (inputs.length === 0 && outputs.length === 0))
			continue
		//console.log(curObj.class);
		if (curObj.class.indexOf("K2Node_CallFunction") !== -1 || curObj.class.indexOf("K2Node_SpawnActorFromClass") !== -1 || curObj.class.indexOf("K2Node_GetInputAxisValue") !== -1 || curObj.class.indexOf("K2Node_MakeArray") !== -1 || curObj.class.indexOf("K2Node_CreateWidget") !== -1) {

			if (curObj.class.indexOf("K2Node_SpawnActorFromClass") !== -1)
				curObj.nodeName = "Spawn Actor"
			else if (curObj.class.indexOf("K2Node_MakeArray") !== -1)
				curObj.nodeName = "Make Array"
			else if (curObj.class.indexOf("K2Node_CreateWidget") !== -1)
				curObj.nodeName = "Construct"
			//console.log(curObj);

			newNode = {
				isPure: curObj.bIsPureFunc && curObj.bIsPureFunc === "True",
				name: curObj.nodeName,
				inputs: inputs,
				outputs: outputs
			};

			if (curObj.class.indexOf("K2Node_MakeArray") !== -1)
				newNode.isPure = true;

			if (newNode.name.indexOf("Conv_") !== -1) {
				nN = new ConverterNode(newNode, x, y);
			}
			else {
				nN = new FunctionNode(newNode, x, y);
			}

		}
		else if (curObj.class.indexOf("K2Node_CallArrayFunction") !== -1) {
			newNode = {
				isPure: curObj.bIsPureFunc && curObj.bIsPureFunc === "True",
				name: curObj.nodeName,
				inputs: inputs,
				outputs: outputs
			};


			nN = new ArrayFunctionNode(newNode, x, y);

		}
		else if (curObj.class.indexOf("EdGraphNode_Comment") !== -1) {
			continue
		}
		else if (curObj.class.indexOf("K2Node_MacroInstance") !== -1 || curObj.class.indexOf("K2Node_IfThenElse") !== -1 || curObj.class.indexOf("K2Node_ExecutionSequence") !== -1) {
			if (curObj.class.indexOf("K2Node_IfThenElse") !== -1)
				curObj.nodeName = "Branch"
			else if (curObj.class.indexOf("K2Node_ExecutionSequence") !== -1)
				curObj.nodeName = "Sequence"
			newNode = {
				name: curObj.nodeName,
				inputs: inputs,
				outputs: outputs
			};

			nN = new MacroNode(newNode, x, y);

		}
		else if (curObj.class.indexOf("K2Node_Event") !== -1 || curObj.class.indexOf("K2Node_CustomEvent") !== -1 || curObj.class.indexOf("K2Node_ComponentBoundEvent") !== -1 || curObj.class.indexOf("K2Node_InputTouch") !== -1 || curObj.class.indexOf("K2Node_InputAction") !== -1 || curObj.class.indexOf("K2Node_InputAxisEvent") !== -1 || curObj.class.indexOf("K2Node_InputKey") !== -1) {
			if (curObj.class && curObj.class.indexOf("K2Node") !== -1)
				curObj.class = curObj.class.replace("K2Node_", "");
			curObj.class = curObj.class.fromCamelCase();
			newNode = {
				name: curObj.nodeName && curObj.nodeName || curObj.class,
				inputs: inputs,
				outputs: outputs,
				isCustom: curObj.isCustom
			};

			nN = new EventNode(newNode, x, y);

		}
		else if (curObj.class.indexOf("K2Node_VariableGet") !== -1 || curObj.class.indexOf("K2Node_Self") !== -1) {
			newNode = {
				outputs: outputs
			};


			nN = new GetterNode(newNode, x, y);

		}
		else if (curObj.class.indexOf("Set") !== -1) {
			newNode = {
				outputs: outputs,
				inputs: inputs
			};
			nN = new SetterNode(newNode, x, y);
		}
		else if (curObj.class.indexOf("Operator") !== -1 || curObj.class.indexOf("K2Node_EnumEquality") !== -1) {
			newNode = {
				name: curObj.nodeName && curObj.nodeName || curObj.class,
				inputs: inputs,
				outputs: outputs
			};
			nN = new BinaryOperatorNode(newNode, x, y);
		}
		else if (curObj.class.indexOf("K2Node_Knot") !== -1) {
			//console.log('KNIT');
			newNode = {
				name: curObj.nodeName && curObj.nodeName || curObj.class,
				inputs: inputs,
				outputs: outputs
			};
			nN = new RerouteNode(newNode, x, y);
		}

		newNodes.push(nN);
	}
	//console.log(newNodes);

	for (var i = 0; i < links.length; i++) {
		var curLink = links[i];
		var from = null;
		var to = null;
		var nodeFrom = null;
		//console.log('current link', curLink);
		//console.log('current link', curLink);
		for (var j = 0; j < newNodes.length; j++) {
			if (newNodes[j].outputs) {
				for (var k = 0; k < newNodes[j].outputs.length; k++) {
					if (newNodes[j].outputs[k].id === curLink.from) {
						from = newNodes[j].outputs[k];
						nodeFrom = newNodes[j];
						break;
					}
				}
			}
			if (newNodes[j].inputs) {
				for (var k = 0; k < newNodes[j].inputs.length; k++) {
					if (newNodes[j].inputs[k].id === curLink.to) {

						to = newNodes[j].inputs[k];
						break;
					}
				}
			}
		}

		nodeFrom.setOutputLink(from, to);

	}

	return newNodes;
}

