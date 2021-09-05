var Common = {};

Common._nextId = 0;
Common._seed = 0;
Common._nowStartTime = +(new Date());
Common._warnedOnce = {};

Common.extend = function (obj, deep) {
    var argsStart,
        deepClone;

    if (typeof deep === 'boolean') {
        argsStart = 2;
        deepClone = deep;
    } else {
        argsStart = 1;
        deepClone = true;
    }

    for (var i = argsStart; i < arguments.length; i++) {
        var source = arguments[i];

        if (source) {
            for (var prop in source) {
                if (deepClone && source[prop] && source[prop].constructor === Object) {
                    if (!obj[prop] || obj[prop].constructor === Object) {
                        obj[prop] = obj[prop] || {};
                        Common.extend(obj[prop], deepClone, source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                } else {
                    obj[prop] = source[prop];
                }
            }
        }
    }

    return obj;
};

Common.clone = function (obj, deep) {
    return Common.extend({}, deep, obj);
};

Common.keys = function (obj) {
    if (Object.keys)
        return Object.keys(obj);


    var keys = [];
    for (var key in obj)
        keys.push(key);
    return keys;
};

Common.values = function (obj) {
    var values = [];

    if (Object.keys) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            values.push(obj[keys[i]]);
        }
        return values;
    }


    for (var key in obj)
        values.push(obj[key]);
    return values;
};

Common.get = function (obj, path, begin, end) {
    path = path.split('.').slice(begin, end);

    for (var i = 0; i < path.length; i += 1) {
        obj = obj[path[i]];
    }

    return obj;
};

Common.set = function (obj, path, val, begin, end) {
    var parts = path.split('.').slice(begin, end);
    Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
    return val;
};


Common.shuffle = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Common.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};


Common.choose = function (choices) {
    return choices[Math.floor(Common.random() * choices.length)];
};


Common.isElement = function (obj) {
    if (typeof HTMLElement !== 'undefined') {
        return obj instanceof HTMLElement;
    }

    return !!(obj && obj.nodeType && obj.nodeName);
};


Common.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};


Common.isFunction = function (obj) {
    return typeof obj === "function";
};


Common.isPlainObject = function (obj) {
    return typeof obj === 'object' && obj.constructor === Object;
};


Common.isString = function (obj) {
    return (typeof obj == "string");
};


Common.clamp = function (value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
};


Common.sign = function (value) {
    return value < 0 ? -1 : 1;
};


Common.now = function () {
    if (typeof window !== 'undefined' && window.performance) {
        if (window.performance.now) {
            return window.performance.now();
        } else if (window.performance.webkitNow) {
            return window.performance.webkitNow();
        }
    }

    if (Date.now) {
        return Date.now();
    }

    return (new Date()) - Common._nowStartTime;
};


Common.random = function (min, max) {
    min = (typeof min !== "undefined") ? min : 0;
    max = (typeof max !== "undefined") ? max : 1;
    return min + _seededRandom() * (max - min);
};

var _seededRandom = function () {

    Common._seed = (Common._seed * 9301 + 49297) % 233280;
    return Common._seed / 233280;
};

Common.logLevel = 1;

Common.log = function () {
    if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
        console.log.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
    }
};

Common.info = function () {
    if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
        console.info.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
    }
};

Common.warn = function () {
    if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
        console.warn.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
    }
};

Common.warnOnce = function () {
    var message = Array.prototype.slice.call(arguments).join(' ');

    if (!Common._warnedOnce[message]) {
        Common.warn(message);
        Common._warnedOnce[message] = true;
    }
};


Common.nextId = function () {
    return Common._nextId++;
};


Common.indexOf = function (haystack, needle) {
    if (haystack.indexOf)
        return haystack.indexOf(needle);

    for (var i = 0; i < haystack.length; i++) {
        if (haystack[i] === needle)
            return i;
    }

    return -1;
};


Common.map = function (list, func) {
    if (list.map) {
        return list.map(func);
    }

    var mapped = [];

    for (var i = 0; i < list.length; i += 1) {
        mapped.push(func(list[i]));
    }

    return mapped;
};


Common.topologicalSort = function (graph) {

    var result = [],
        visited = [],
        temp = [];

    for (var node in graph) {
        if (!visited[node] && !temp[node]) {
            Common._topologicalSort(node, visited, temp, graph, result);
        }
    }

    return result;
};

Common._topologicalSort = function (node, visited, temp, graph, result) {
    var neighbors = graph[node] || [];
    temp[node] = true;

    for (var i = 0; i < neighbors.length; i += 1) {
        var neighbor = neighbors[i];

        if (temp[neighbor]) {

            continue;
        }

        if (!visited[neighbor]) {
            Common._topologicalSort(neighbor, visited, temp, graph, result);
        }
    }

    temp[node] = false;
    visited[node] = true;

    result.push(node);
};

Common.chain = function () {
    var funcs = [];

    for (var i = 0; i < arguments.length; i += 1) {
        var func = arguments[i];

        if (func._chained) {

            funcs.push.apply(funcs, func._chained);
        } else {
            funcs.push(func);
        }
    }

    var chain = function () {

        var lastResult,
            args = new Array(arguments.length);

        for (var i = 0, l = arguments.length; i < l; i++) {
            args[i] = arguments[i];
        }

        for (i = 0; i < funcs.length; i += 1) {
            var result = funcs[i].apply(lastResult, args);

            if (typeof result !== 'undefined') {
                lastResult = result;
            }
        }

        return lastResult;
    };

    chain._chained = funcs;

    return chain;
};

Common.chainPathBefore = function (base, path, func) {
    return Common.set(base, path, Common.chain(
        func,
        Common.get(base, path)
    ));
};

Common.chainPathAfter = function (base, path, func) {
    return Common.set(base, path, Common.chain(
        Common.get(base, path),
        func
    ));
};

var Bounds = {};


Bounds.create = function (vertices) {
    var bounds = {
        min: {
            x: 0,
            y: 0
        },
        max: {
            x: 0,
            y: 0
        }
    };

    if (vertices)
        Bounds.update(bounds, vertices);

    return bounds;
};


Bounds.update = function (bounds, vertices, velocity) {
    bounds.min.x = Infinity;
    bounds.max.x = -Infinity;
    bounds.min.y = Infinity;
    bounds.max.y = -Infinity;

    for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;
        if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;
        if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;
        if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;
    }

    if (velocity) {
        if (velocity.x > 0) {
            bounds.max.x += velocity.x;
        } else {
            bounds.min.x += velocity.x;
        }

        if (velocity.y > 0) {
            bounds.max.y += velocity.y;
        } else {
            bounds.min.y += velocity.y;
        }
    }
};


Bounds.contains = function (bounds, point) {
    return point.x >= bounds.min.x && point.x <= bounds.max.x &&
        point.y >= bounds.min.y && point.y <= bounds.max.y;
};


Bounds.overlaps = function (boundsA, boundsB) {
    return (boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x &&
        boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y);
};


Bounds.translate = function (bounds, vector) {
    bounds.min.x += vector.x;
    bounds.max.x += vector.x;
    bounds.min.y += vector.y;
    bounds.max.y += vector.y;
};


Bounds.shift = function (bounds, position) {
    var deltaX = bounds.max.x - bounds.min.x,
        deltaY = bounds.max.y - bounds.min.y;

    bounds.min.x = position.x;
    bounds.max.x = position.x + deltaX;
    bounds.min.y = position.y;
    bounds.max.y = position.y + deltaY;
};

var Vector = {};


Vector.create = function (x, y) {
    return {
        x: x || 0,
        y: y || 0
    };
};


Vector.clone = function (vector) {
    return {
        x: vector.x,
        y: vector.y
    };
};


Vector.magnitude = function (vector) {
    return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
};


Vector.magnitudeSquared = function (vector) {
    return (vector.x * vector.x) + (vector.y * vector.y);
};


Vector.rotate = function (vector, angle, output) {
    var cos = Math.cos(angle),
        sin = Math.sin(angle);
    if (!output) output = {};
    var x = vector.x * cos - vector.y * sin;
    output.y = vector.x * sin + vector.y * cos;
    output.x = x;
    return output;
};

Vector.rotateAbout = function (vector, angle, point, output) {
    var cos = Math.cos(angle),
        sin = Math.sin(angle);
    if (!output) output = {};
    var x = point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin);
    output.y = point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos);
    output.x = x;
    return output;
};


Vector.normalise = function (vector) {
    var magnitude = Vector.magnitude(vector);
    if (magnitude === 0)
        return {
            x: 0,
            y: 0
        };
    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude
    };
};


Vector.dot = function (vectorA, vectorB) {
    return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);
};


Vector.cross = function (vectorA, vectorB) {
    return (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x);
};


Vector.cross3 = function (vectorA, vectorB, vectorC) {
    return (vectorB.x - vectorA.x) * (vectorC.y - vectorA.y) - (vectorB.y - vectorA.y) * (vectorC.x - vectorA.x);
};


Vector.add = function (vectorA, vectorB, output) {
    if (!output) output = {};
    output.x = vectorA.x + vectorB.x;
    output.y = vectorA.y + vectorB.y;
    return output;
};


Vector.sub = function (vectorA, vectorB, output) {
    if (!output) output = {};
    output.x = vectorA.x - vectorB.x;
    output.y = vectorA.y - vectorB.y;
    return output;
};


Vector.mult = function (vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
};


Vector.div = function (vector, scalar) {
    return {
        x: vector.x / scalar,
        y: vector.y / scalar
    };
};


Vector.perp = function (vector, negate) {
    negate = negate === true ? -1 : 1;
    return {
        x: negate * -vector.y,
        y: negate * vector.x
    };
};


Vector.neg = function (vector) {
    return {
        x: -vector.x,
        y: -vector.y
    };
};


Vector.angle = function (vectorA, vectorB) {
    return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
};


Vector._temp = [
    Vector.create(), Vector.create(),
    Vector.create(), Vector.create(),
    Vector.create(), Vector.create()
];

var Vertices = {};


Vertices.create = function (points, body) {
    var vertices = [];

    for (var i = 0; i < points.length; i++) {
        var point = points[i],
            vertex = {
                x: point.x,
                y: point.y,
                index: i,
                body: body,
                isInternal: false
            };

        vertices.push(vertex);
    }

    return vertices;
};


Vertices.fromPath = function (path, body) {
    var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig,
        points = [];

    path.replace(pathPattern, function (match, x, y) {
        points.push({
            x: parseFloat(x),
            y: parseFloat(y)
        });
    });

    return Vertices.create(points, body);
};


Vertices.centre = function (vertices) {
    var area = Vertices.area(vertices, true),
        centre = {
            x: 0,
            y: 0
        },
        cross,
        temp,
        j;

    for (var i = 0; i < vertices.length; i++) {
        j = (i + 1) % vertices.length;
        cross = Vector.cross(vertices[i], vertices[j]);
        temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);
        centre = Vector.add(centre, temp);
    }

    return Vector.div(centre, 6 * area);
};


Vertices.mean = function (vertices) {
    var average = {
        x: 0,
        y: 0
    };

    for (var i = 0; i < vertices.length; i++) {
        average.x += vertices[i].x;
        average.y += vertices[i].y;
    }

    return Vector.div(average, vertices.length);
};


Vertices.area = function (vertices, signed) {
    var area = 0,
        j = vertices.length - 1;

    for (var i = 0; i < vertices.length; i++) {
        area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
        j = i;
    }

    if (signed)
        return area / 2;

    return Math.abs(area) / 2;
};


Vertices.inertia = function (vertices, mass) {
    var numerator = 0,
        denominator = 0,
        v = vertices,
        cross,
        j;



    for (var n = 0; n < v.length; n++) {
        j = (n + 1) % v.length;
        cross = Math.abs(Vector.cross(v[j], v[n]));
        numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
        denominator += cross;
    }

    return (mass / 6) * (numerator / denominator);
};


Vertices.translate = function (vertices, vector, scalar) {
    var i;
    if (scalar) {
        for (i = 0; i < vertices.length; i++) {
            vertices[i].x += vector.x * scalar;
            vertices[i].y += vector.y * scalar;
        }
    } else {
        for (i = 0; i < vertices.length; i++) {
            vertices[i].x += vector.x;
            vertices[i].y += vector.y;
        }
    }

    return vertices;
};


Vertices.rotate = function (vertices, angle, point) {
    if (angle === 0)
        return;

    var cos = Math.cos(angle),
        sin = Math.sin(angle);

    for (var i = 0; i < vertices.length; i++) {
        var vertice = vertices[i],
            dx = vertice.x - point.x,
            dy = vertice.y - point.y;

        vertice.x = point.x + (dx * cos - dy * sin);
        vertice.y = point.y + (dx * sin + dy * cos);
    }

    return vertices;
};


Vertices.contains = function (vertices, point) {
    for (var i = 0; i < vertices.length; i++) {
        var vertice = vertices[i],
            nextVertice = vertices[(i + 1) % vertices.length];
        if ((point.x - vertice.x) * (nextVertice.y - vertice.y) + (point.y - vertice.y) * (vertice.x - nextVertice.x) > 0) {
            return false;
        }
    }

    return true;
};


Vertices.scale = function (vertices, scaleX, scaleY, point) {
    if (scaleX === 1 && scaleY === 1)
        return vertices;

    point = point || Vertices.centre(vertices);

    var vertex,
        delta;

    for (var i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        delta = Vector.sub(vertex, point);
        vertices[i].x = point.x + delta.x * scaleX;
        vertices[i].y = point.y + delta.y * scaleY;
    }

    return vertices;
};


Vertices.chamfer = function (vertices, radius, quality, qualityMin, qualityMax) {
    if (typeof radius === 'number') {
        radius = [radius];
    } else {
        radius = radius || [8];
    }


    quality = (typeof quality !== 'undefined') ? quality : -1;
    qualityMin = qualityMin || 2;
    qualityMax = qualityMax || 14;

    var newVertices = [];

    for (var i = 0; i < vertices.length; i++) {
        var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1],
            vertex = vertices[i],
            nextVertex = vertices[(i + 1) % vertices.length],
            currentRadius = radius[i < radius.length ? i : radius.length - 1];

        if (currentRadius === 0) {
            newVertices.push(vertex);
            continue;
        }

        var prevNormal = Vector.normalise({
            x: vertex.y - prevVertex.y,
            y: prevVertex.x - vertex.x
        });

        var nextNormal = Vector.normalise({
            x: nextVertex.y - vertex.y,
            y: vertex.x - nextVertex.x
        });

        var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)),
            radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius),
            midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)),
            scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));

        var precision = quality;

        if (quality === -1) {

            precision = Math.pow(currentRadius, 0.32) * 1.75;
        }

        precision = Common.clamp(precision, qualityMin, qualityMax);


        if (precision % 2 === 1)
            precision += 1;

        var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)),
            theta = alpha / precision;

        for (var j = 0; j < precision; j++) {
            newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));
        }
    }

    return newVertices;
};


Vertices.clockwiseSort = function (vertices) {
    var centre = Vertices.mean(vertices);

    vertices.sort(function (vertexA, vertexB) {
        return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
    });

    return vertices;
};

var Events = {};

Events.on = function (object, eventNames, callback) {
    var names = eventNames.split(' '),
        name;

    for (var i = 0; i < names.length; i++) {
        name = names[i];
        object.events = object.events || {};
        object.events[name] = object.events[name] || [];
        object.events[name].push(callback);
    }

    return callback;
};

Events.off = function (object, eventNames, callback) {
    if (!eventNames) {
        object.events = {};
        return;
    }


    if (typeof eventNames === 'function') {
        callback = eventNames;
        eventNames = Common.keys(object.events).join(' ');
    }

    var names = eventNames.split(' ');

    for (var i = 0; i < names.length; i++) {
        var callbacks = object.events[names[i]],
            newCallbacks = [];

        if (callback && callbacks) {
            for (var j = 0; j < callbacks.length; j++) {
                if (callbacks[j] !== callback)
                    newCallbacks.push(callbacks[j]);
            }
        }

        object.events[names[i]] = newCallbacks;
    }
};

Events.trigger = function (object, eventNames, event) {
    var names,
        name,
        callbacks,
        eventClone;

    var events = object.events;

    if (events && Common.keys(events).length > 0) {
        if (!event)
            event = {};

        names = eventNames.split(' ');

        for (var i = 0; i < names.length; i++) {
            name = names[i];
            callbacks = events[name];

            if (callbacks) {
                eventClone = Common.clone(event, false);
                eventClone.name = name;
                eventClone.source = object;

                for (var j = 0; j < callbacks.length; j++) {
                    callbacks[j].apply(object, [eventClone]);
                }
            }
        }
    }
};

var Composite = {};

Composite.create = function (options) {
    return Common.extend({
        id: Common.nextId(),
        type: 'composite',
        parent: null,
        isModified: false,
        bodies: [],
        composites: [],
        label: 'Composite',
        plugin: {}
    }, options);
};


Composite.setModified = function (composite, isModified, updateParents, updateChildren) {
    composite.isModified = isModified;

    if (updateParents && composite.parent) {
        Composite.setModified(composite.parent, isModified, updateParents, updateChildren);
    }

    if (updateChildren) {
        for (var i = 0; i < composite.composites.length; i++) {
            var childComposite = composite.composites[i];
            Composite.setModified(childComposite, isModified, updateParents, updateChildren);
        }
    }
};


Composite.add = function (composite, object) {
    var objects = [].concat(object);

    Events.trigger(composite, 'beforeAdd', {
        object: object
    });

    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];

        switch (obj.type) {

            case 'body':

                if (obj.parent !== obj) {
                    Common.warn('Composite.add: skipped adding a compound body part (you must add its parent instead)');
                    break;
                }

                Composite.addBody(composite, obj);
                break;
            case 'composite':
                Composite.addComposite(composite, obj);
                break;

        }
    }

    Events.trigger(composite, 'afterAdd', {
        object: object
    });

    return composite;
};


Composite.remove = function (composite, object, deep) {
    var objects = [].concat(object);

    Events.trigger(composite, 'beforeRemove', {
        object: object
    });

    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];

        switch (obj.type) {

            case 'body':
                Composite.removeBody(composite, obj, deep);
                break;
            case 'composite':
                Composite.removeComposite(composite, obj, deep);
                break;

        }
    }

    Events.trigger(composite, 'afterRemove', {
        object: object
    });

    return composite;
};


Composite.addComposite = function (compositeA, compositeB) {
    compositeA.composites.push(compositeB);
    compositeB.parent = compositeA;
    Composite.setModified(compositeA, true, true, false);
    return compositeA;
};


Composite.removeComposite = function (compositeA, compositeB, deep) {
    var position = Common.indexOf(compositeA.composites, compositeB);
    if (position !== -1) {
        Composite.removeCompositeAt(compositeA, position);
        Composite.setModified(compositeA, true, true, false);
    }

    if (deep) {
        for (var i = 0; i < compositeA.composites.length; i++) {
            Composite.removeComposite(compositeA.composites[i], compositeB, true);
        }
    }

    return compositeA;
};


Composite.removeCompositeAt = function (composite, position) {
    composite.composites.splice(position, 1);
    Composite.setModified(composite, true, true, false);
    return composite;
};


Composite.addBody = function (composite, body) {
    composite.bodies.push(body);
    Composite.setModified(composite, true, true, false);
    return composite;
};


Composite.removeBody = function (composite, body, deep) {
    var position = Common.indexOf(composite.bodies, body);
    if (position !== -1) {
        Composite.removeBodyAt(composite, position);
        Composite.setModified(composite, true, true, false);
    }

    if (deep) {
        for (var i = 0; i < composite.composites.length; i++) {
            Composite.removeBody(composite.composites[i], body, true);
        }
    }

    return composite;
};


Composite.removeBodyAt = function (composite, position) {
    composite.bodies.splice(position, 1);
    Composite.setModified(composite, true, true, false);
    return composite;
};


Composite.clear = function (composite, keepStatic, deep) {
    if (deep) {
        for (var i = 0; i < composite.composites.length; i++) {
            Composite.clear(composite.composites[i], keepStatic, true);
        }
    }

    if (keepStatic) {
        composite.bodies = composite.bodies.filter(function (body) {
            return body.isStatic;
        });
    } else {
        composite.bodies.length = 0;
    }

    composite.composites.length = 0;
    Composite.setModified(composite, true, true, false);

    return composite;
};


Composite.allBodies = function (composite) {
    var bodies = [].concat(composite.bodies);

    for (var i = 0; i < composite.composites.length; i++)
        bodies = bodies.concat(Composite.allBodies(composite.composites[i]));

    return bodies;
};


Composite.allComposites = function (composite) {
    var composites = [].concat(composite.composites);

    for (var i = 0; i < composite.composites.length; i++)
        composites = composites.concat(Composite.allComposites(composite.composites[i]));

    return composites;
};

var Body = {};
Body._inertiaScale = 4;
Body._nextCollidingGroupId = 1;
Body._nextNonCollidingGroupId = -1;
Body._nextCategory = 0x0001;

Body.create = function (options) {
    var defaults = {
        id: Common.nextId(),
        type: 'body',
        label: 'Body',
        parts: [],
        plugin: {},
        angle: 0,
        vertices: Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40'),
        position: {
            x: 0,
            y: 0
        },
        force: {
            x: 0,
            y: 0
        },
        torque: 0,
        positionImpulse: {
            x: 0,
            y: 0
        },
        constraintImpulse: {
            x: 0,
            y: 0,
            angle: 0
        },
        totalContacts: 0,
        speed: 0,
        angularSpeed: 0,
        velocity: {
            x: 0,
            y: 0
        },
        angularVelocity: 0,
        isSensor: false,
        isStatic: false,
        isSleeping: false,
        motion: 0,
        sleepThreshold: 60,
        density: 0.001,
        restitution: 0,
        friction: 0.1,
        frictionStatic: 0.5,
        frictionAir: 0.01,
        collisionFilter: {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: 0
        },
        slop: 0.05,
        timeScale: 1,
        render: {
            visible: true,
            opacity: 1,
            strokeStyle: null,
            fillStyle: null,
            lineWidth: null,
            sprite: {
                xScale: 1,
                yScale: 1,
                xOffset: 0,
                yOffset: 0
            }
        },
        events: null,
        bounds: null,
        chamfer: null,
        circleRadius: 0,
        positionPrev: null,
        anglePrev: 0,
        parent: null,
        axes: null,
        area: 0,
        mass: 0,
        inertia: 0,
        _original: null
    };

    var body = Common.extend(defaults, options);

    _initProperties(body, options);

    MatterAttractors.Body.init(body);

    return body;
};

var _initProperties = function (body, options) {
    options = options || {};


    Body.set(body, {
        bounds: body.bounds || Bounds.create(body.vertices),
        positionPrev: body.positionPrev || Vector.clone(body.position),
        anglePrev: body.anglePrev || body.angle,
        vertices: body.vertices,
        parts: body.parts || [body],
        isStatic: body.isStatic,
        isSleeping: body.isSleeping,
        parent: body.parent || body
    });

    Vertices.rotate(body.vertices, body.angle, body.position);
    Axes.rotate(body.axes, body.angle);
    Bounds.update(body.bounds, body.vertices, body.velocity);


    Body.set(body, {
        axes: options.axes || body.axes,
        area: options.area || body.area,
        mass: options.mass || body.mass,
        inertia: options.inertia || body.inertia
    });


    var defaultFillStyle = (body.isStatic ? '#14151f' : Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1'])),
        defaultStrokeStyle = body.isStatic ? '#555' : '#ccc',
        defaultLineWidth = body.isStatic && body.render.fillStyle === null ? 1 : 0;
    body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
    body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
    body.render.lineWidth = body.render.lineWidth || defaultLineWidth;
    body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
    body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
};

Body.set = function (body, settings, value) {
    var property;

    if (typeof settings === 'string') {
        property = settings;
        settings = {};
        settings[property] = value;
    }

    for (property in settings) {
        if (!Object.prototype.hasOwnProperty.call(settings, property))
            continue;

        value = settings[property];
        switch (property) {

            case 'isStatic':
                Body.setStatic(body, value);
                break;
            case 'isSleeping':
                Sleeping.set(body, value);
                break;
            case 'mass':
                Body.setMass(body, value);
                break;
            case 'density':
                Body.setDensity(body, value);
                break;
            case 'inertia':
                Body.setInertia(body, value);
                break;
            case 'vertices':
                Body.setVertices(body, value);
                break;
            case 'position':
                Body.setPosition(body, value);
                break;
            case 'angle':
                Body.setAngle(body, value);
                break;
            case 'velocity':
                Body.setVelocity(body, value);
                break;
            case 'angularVelocity':
                Body.setAngularVelocity(body, value);
                break;
            case 'parts':
                Body.setParts(body, value);
                break;
            case 'centre':
                Body.setCentre(body, value);
                break;
            default:
                body[property] = value;

        }
    }
};


Body.setStatic = function (body, isStatic) {
    for (var i = 0; i < body.parts.length; i++) {
        var part = body.parts[i];
        part.isStatic = isStatic;

        if (isStatic) {
            part._original = {
                restitution: part.restitution,
                friction: part.friction,
                mass: part.mass,
                inertia: part.inertia,
                density: part.density,
                inverseMass: part.inverseMass,
                inverseInertia: part.inverseInertia
            };

            part.restitution = 0;
            part.friction = 1;
            part.mass = part.inertia = part.density = Infinity;
            part.inverseMass = part.inverseInertia = 0;

            part.positionPrev.x = part.position.x;
            part.positionPrev.y = part.position.y;
            part.anglePrev = part.angle;
            part.angularVelocity = 0;
            part.speed = 0;
            part.angularSpeed = 0;
            part.motion = 0;
        } else if (part._original) {
            part.restitution = part._original.restitution;
            part.friction = part._original.friction;
            part.mass = part._original.mass;
            part.inertia = part._original.inertia;
            part.density = part._original.density;
            part.inverseMass = part._original.inverseMass;
            part.inverseInertia = part._original.inverseInertia;

            part._original = null;
        }
    }
};


Body.setMass = function (body, mass) {
    var moment = body.inertia / (body.mass / 6);
    body.inertia = moment * (mass / 6);
    body.inverseInertia = 1 / body.inertia;

    body.mass = mass;
    body.inverseMass = 1 / body.mass;
    body.density = body.mass / body.area;
};


Body.setDensity = function (body, density) {
    Body.setMass(body, density * body.area);
    body.density = density;
};


Body.setInertia = function (body, inertia) {
    body.inertia = inertia;
    body.inverseInertia = 1 / body.inertia;
};


Body.setVertices = function (body, vertices) {

    if (vertices[0].body === body) {
        body.vertices = vertices;
    } else {
        body.vertices = Vertices.create(vertices, body);
    }


    body.axes = Axes.fromVertices(body.vertices);
    body.area = Vertices.area(body.vertices);
    Body.setMass(body, body.density * body.area);


    var centre = Vertices.centre(body.vertices);
    Vertices.translate(body.vertices, centre, -1);


    Body.setInertia(body, Body._inertiaScale * Vertices.inertia(body.vertices, body.mass));


    Vertices.translate(body.vertices, body.position);
    Bounds.update(body.bounds, body.vertices, body.velocity);
};


Body.setParts = function (body, parts, autoHull) {
    var i;


    parts = parts.slice(0);
    body.parts.length = 0;
    body.parts.push(body);
    body.parent = body;

    for (i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part !== body) {
            part.parent = body;
            body.parts.push(part);
        }
    }

    if (body.parts.length === 1)
        return;

    //REMOVED
};


Body.setCentre = function (body, centre, relative) {
    if (!relative) {
        body.positionPrev.x = centre.x - (body.position.x - body.positionPrev.x);
        body.positionPrev.y = centre.y - (body.position.y - body.positionPrev.y);
        body.position.x = centre.x;
        body.position.y = centre.y;
    } else {
        body.positionPrev.x += centre.x;
        body.positionPrev.y += centre.y;
        body.position.x += centre.x;
        body.position.y += centre.y;
    }
};


Body.setPosition = function (body, position) {
    var delta = Vector.sub(position, body.position);
    body.positionPrev.x += delta.x;
    body.positionPrev.y += delta.y;

    for (var i = 0; i < body.parts.length; i++) {
        var part = body.parts[i];
        part.position.x += delta.x;
        part.position.y += delta.y;
        Vertices.translate(part.vertices, delta);
        Bounds.update(part.bounds, part.vertices, body.velocity);
    }
};


Body.setAngle = function (body, angle) {
    var delta = angle - body.angle;
    body.anglePrev += delta;

    for (var i = 0; i < body.parts.length; i++) {
        var part = body.parts[i];
        part.angle += delta;
        Vertices.rotate(part.vertices, delta, body.position);
        Axes.rotate(part.axes, delta);
        Bounds.update(part.bounds, part.vertices, body.velocity);
        if (i > 0) {
            Vector.rotateAbout(part.position, delta, body.position, part.position);
        }
    }
};


Body.setVelocity = function (body, velocity) {
    body.positionPrev.x = body.position.x - velocity.x;
    body.positionPrev.y = body.position.y - velocity.y;
    body.velocity.x = velocity.x;
    body.velocity.y = velocity.y;
    body.speed = Vector.magnitude(body.velocity);
};


Body.setAngularVelocity = function (body, velocity) {
    body.anglePrev = body.angle - velocity;
    body.angularVelocity = velocity;
    body.angularSpeed = Math.abs(body.angularVelocity);
};


Body.translate = function (body, translation) {
    Body.setPosition(body, Vector.add(body.position, translation));
};


Body.rotate = function (body, rotation, point) {
    if (!point) {
        Body.setAngle(body, body.angle + rotation);
    } else {
        var cos = Math.cos(rotation),
            sin = Math.sin(rotation),
            dx = body.position.x - point.x,
            dy = body.position.y - point.y;

        Body.setPosition(body, {
            x: point.x + (dx * cos - dy * sin),
            y: point.y + (dx * sin + dy * cos)
        });

        Body.setAngle(body, body.angle + rotation);
    }
};


Body.scale = function (body, scaleX, scaleY, point) {
    var totalArea = 0,
        totalInertia = 0;

    point = point || body.position;

    for (var i = 0; i < body.parts.length; i++) {
        var part = body.parts[i];


        Vertices.scale(part.vertices, scaleX, scaleY, point);


        part.axes = Axes.fromVertices(part.vertices);
        part.area = Vertices.area(part.vertices);
        Body.setMass(part, body.density * part.area);


        Vertices.translate(part.vertices, {
            x: -part.position.x,
            y: -part.position.y
        });
        Body.setInertia(part, Body._inertiaScale * Vertices.inertia(part.vertices, part.mass));
        Vertices.translate(part.vertices, {
            x: part.position.x,
            y: part.position.y
        });

        if (i > 0) {
            totalArea += part.area;
            totalInertia += part.inertia;
        }


        part.position.x = point.x + (part.position.x - point.x) * scaleX;
        part.position.y = point.y + (part.position.y - point.y) * scaleY;


        Bounds.update(part.bounds, part.vertices, body.velocity);
    }


    if (body.parts.length > 1) {
        body.area = totalArea;

        if (!body.isStatic) {
            Body.setMass(body, body.density * totalArea);
            Body.setInertia(body, totalInertia);
        }
    }


    if (body.circleRadius) {
        if (scaleX === scaleY) {
            body.circleRadius *= scaleX;
        } else {

            body.circleRadius = null;
        }
    }
};


Body.update = function (body, deltaTime, timeScale, correction) {
    var deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);


    var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
        velocityPrevX = body.position.x - body.positionPrev.x,
        velocityPrevY = body.position.y - body.positionPrev.y;


    body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
    body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;

    body.positionPrev.x = body.position.x;
    body.positionPrev.y = body.position.y;
    body.position.x += body.velocity.x;
    body.position.y += body.velocity.y;


    body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
    body.anglePrev = body.angle;
    body.angle += body.angularVelocity;


    body.speed = Vector.magnitude(body.velocity);
    body.angularSpeed = Math.abs(body.angularVelocity);


    for (var i = 0; i < body.parts.length; i++) {
        var part = body.parts[i];

        Vertices.translate(part.vertices, body.velocity);

        if (i > 0) {
            part.position.x += body.velocity.x;
            part.position.y += body.velocity.y;
        }

        if (body.angularVelocity !== 0) {
            Vertices.rotate(part.vertices, body.angularVelocity, body.position);
            Axes.rotate(part.axes, body.angularVelocity);
            if (i > 0) {
                Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
            }
        }

        Bounds.update(part.bounds, part.vertices, body.velocity);
    }
};


Body.applyForce = function (body, position, force) {
    body.force.x += force.x;
    body.force.y += force.y;
    var offset = {
        x: position.x - body.position.x,
        y: position.y - body.position.y
    };
    body.torque += offset.x * force.y - offset.y * force.x;
};

var Sleeping = {};

Sleeping._motionWakeThreshold = 0.18;
Sleeping._motionSleepThreshold = 0.08;
Sleeping._minBias = 0.9;


Sleeping.update = function (bodies, timeScale) {
    var timeFactor = timeScale * timeScale * timeScale;


    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i],
            motion = body.speed * body.speed + body.angularSpeed * body.angularSpeed;


        if (body.force.x !== 0 || body.force.y !== 0) {
            Sleeping.set(body, false);
            continue;
        }

        var minMotion = Math.min(body.motion, motion),
            maxMotion = Math.max(body.motion, motion);


        body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;

        if (body.sleepThreshold > 0 && body.motion < Sleeping._motionSleepThreshold * timeFactor) {
            body.sleepCounter += 1;

            if (body.sleepCounter >= body.sleepThreshold)
                Sleeping.set(body, true);
        } else if (body.sleepCounter > 0) {
            body.sleepCounter -= 1;
        }
    }
};


Sleeping.afterCollisions = function (pairs, timeScale) {
    var timeFactor = timeScale * timeScale * timeScale;


    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];


        if (!pair.isActive)
            continue;

        var collision = pair.collision,
            bodyA = collision.bodyA.parent,
            bodyB = collision.bodyB.parent;


        if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)
            continue;

        if (bodyA.isSleeping || bodyB.isSleeping) {
            var sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,
                movingBody = sleepingBody === bodyA ? bodyB : bodyA;

            if (!sleepingBody.isStatic && movingBody.motion > Sleeping._motionWakeThreshold * timeFactor) {
                Sleeping.set(sleepingBody, false);
            }
        }
    }
};


Sleeping.set = function (body, isSleeping) {
    var wasSleeping = body.isSleeping;

    if (isSleeping) {
        body.isSleeping = true;
        body.sleepCounter = body.sleepThreshold;

        body.positionImpulse.x = 0;
        body.positionImpulse.y = 0;

        body.positionPrev.x = body.position.x;
        body.positionPrev.y = body.position.y;

        body.anglePrev = body.angle;
        body.speed = 0;
        body.angularSpeed = 0;
        body.motion = 0;

        if (!wasSleeping) {
            Events.trigger(body, 'sleepStart');
        }
    } else {
        body.isSleeping = false;
        body.sleepCounter = 0;

        if (wasSleeping) {
            Events.trigger(body, 'sleepEnd');
        }
    }
};

var Pair = {};

Pair.create = function (collision, timestamp) {
    var bodyA = collision.bodyA,
        bodyB = collision.bodyB,
        parentA = collision.parentA,
        parentB = collision.parentB;

    var pair = {
        id: Pair.id(bodyA, bodyB),
        bodyA: bodyA,
        bodyB: bodyB,
        contacts: {},
        activeContacts: [],
        separation: 0,
        isActive: true,
        confirmedActive: true,
        isSensor: bodyA.isSensor || bodyB.isSensor,
        timeCreated: timestamp,
        timeUpdated: timestamp,
        inverseMass: parentA.inverseMass + parentB.inverseMass,
        friction: Math.min(parentA.friction, parentB.friction),
        frictionStatic: Math.max(parentA.frictionStatic, parentB.frictionStatic),
        restitution: Math.max(parentA.restitution, parentB.restitution),
        slop: Math.max(parentA.slop, parentB.slop)
    };

    Pair.update(pair, collision, timestamp);

    return pair;
};


Pair.update = function (pair, collision, timestamp) {
    var contacts = pair.contacts,
        supports = collision.supports,
        activeContacts = pair.activeContacts,
        parentA = collision.parentA,
        parentB = collision.parentB;

    pair.collision = collision;
    pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
    pair.friction = Math.min(parentA.friction, parentB.friction);
    pair.frictionStatic = Math.max(parentA.frictionStatic, parentB.frictionStatic);
    pair.restitution = Math.max(parentA.restitution, parentB.restitution);
    pair.slop = Math.max(parentA.slop, parentB.slop);
    activeContacts.length = 0;

    if (collision.collided) {
        for (var i = 0; i < supports.length; i++) {
            var support = supports[i],
                contactId = Contact.id(support),
                contact = contacts[contactId];

            if (contact) {
                activeContacts.push(contact);
            } else {
                activeContacts.push(contacts[contactId] = Contact.create(support));
            }
        }

        pair.separation = collision.depth;
        Pair.setActive(pair, true, timestamp);
    } else {
        if (pair.isActive === true)
            Pair.setActive(pair, false, timestamp);
    }
};


Pair.setActive = function (pair, isActive, timestamp) {
    if (isActive) {
        pair.isActive = true;
        pair.timeUpdated = timestamp;
    } else {
        pair.isActive = false;
        pair.activeContacts.length = 0;
    }
};


Pair.id = function (bodyA, bodyB) {
    if (bodyA.id < bodyB.id) {
        return 'A' + bodyA.id + 'B' + bodyB.id;
    } else {
        return 'A' + bodyB.id + 'B' + bodyA.id;
    }
};

var Axes = {};


Axes.fromVertices = function (vertices) {
    var axes = {};


    for (var i = 0; i < vertices.length; i++) {
        var j = (i + 1) % vertices.length,
            normal = Vector.normalise({
                x: vertices[j].y - vertices[i].y,
                y: vertices[i].x - vertices[j].x
            }),
            gradient = (normal.y === 0) ? Infinity : (normal.x / normal.y);


        gradient = gradient.toFixed(3).toString();
        axes[gradient] = normal;
    }

    return Common.values(axes);
};


Axes.rotate = function (axes, angle) {
    if (angle === 0)
        return;

    var cos = Math.cos(angle),
        sin = Math.sin(angle);

    for (var i = 0; i < axes.length; i++) {
        var axis = axes[i],
            xx;
        xx = axis.x * cos - axis.y * sin;
        axis.y = axis.x * sin + axis.y * cos;
        axis.x = xx;
    }
};

var Bodies = {};

Bodies.circle = function (x, y, radius, options, maxSides) {
    options = options || {};

    var circle = {
        label: 'Circle Body',
        circleRadius: radius
    };


    maxSides = maxSides || 25;
    var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));


    if (sides % 2 === 1)
        sides += 1;

    return Bodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));
};


Bodies.polygon = function (x, y, sides, radius, options) {
    options = options || {};

    if (sides < 3)
        return Bodies.circle(x, y, radius, options);

    var theta = 2 * Math.PI / sides,
        path = '',
        offset = theta * 0.5;

    for (var i = 0; i < sides; i += 1) {
        var angle = offset + (i * theta),
            xx = Math.cos(angle) * radius,
            yy = Math.sin(angle) * radius;

        path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
    }

    var polygon = {
        label: 'Polygon Body',
        position: {
            x: x,
            y: y
        },
        vertices: Vertices.fromPath(path)
    };

    if (options.chamfer) {
        var chamfer = options.chamfer;
        polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius,
            chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
        delete options.chamfer;
    }

    return Body.create(Common.extend({}, polygon, options));
};


Bodies.fromVertices = function (x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea, removeDuplicatePoints) {
    var body,
        parts,
        vertices,
        i,
        j,
        k,
        v,
        z;

    options = options || {};
    parts = [];

    flagInternal = typeof flagInternal !== 'undefined' ? flagInternal : false;
    removeCollinear = typeof removeCollinear !== 'undefined' ? removeCollinear : 0.01;
    minimumArea = typeof minimumArea !== 'undefined' ? minimumArea : 10;
    removeDuplicatePoints = typeof removeDuplicatePoints !== 'undefined' ? removeDuplicatePoints : 0.01;


    if (!Common.isArray(vertexSets[0])) {
        vertexSets = [vertexSets];
    }

    for (v = 0; v < vertexSets.length; v += 1) {
        vertices = vertexSets[v];

        vertices = Vertices.clockwiseSort(vertices);

        parts.push({
            position: {
                x: x,
                y: y
            },
            vertices: vertices
        });
    }


    for (i = 0; i < parts.length; i++) {
        parts[i] = Body.create(Common.extend(parts[i], options));
    }


    if (flagInternal) {
        var coincident_max_dist = 5;

        for (i = 0; i < parts.length; i++) {
            var partA = parts[i];

            for (j = i + 1; j < parts.length; j++) {
                var partB = parts[j];

                if (Bounds.overlaps(partA.bounds, partB.bounds)) {
                    var pav = partA.vertices,
                        pbv = partB.vertices;


                    for (k = 0; k < partA.vertices.length; k++) {
                        for (z = 0; z < partB.vertices.length; z++) {

                            var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])),
                                db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));


                            if (da < coincident_max_dist && db < coincident_max_dist) {
                                pav[k].isInternal = true;
                                pbv[z].isInternal = true;
                            }
                        }
                    }

                }
            }
        }
    }

    if (parts.length > 1) {

        body = Body.create(Common.extend({
            parts: parts.slice(0)
        }, options));


        Body.setPosition(body, {
            x: x,
            y: y
        });

        return body;
    } else {
        return parts[0];
    }
};

var Mouse = {};

Mouse.create = function (element) {
    var mouse = {};

    if (!element) {
        Common.log('Mouse.create: element was undefined, defaulting to document.body', 'warn');
    }

    mouse.element = element || document.body;
    mouse.absolute = {
        x: 0,
        y: 0
    };
    mouse.position = {
        x: 0,
        y: 0
    };
    mouse.mousedownPosition = {
        x: 0,
        y: 0
    };
    mouse.mouseupPosition = {
        x: 0,
        y: 0
    };
    mouse.offset = {
        x: 0,
        y: 0
    };
    mouse.scale = {
        x: 1,
        y: 1
    };
    mouse.wheelDelta = 0;
    mouse.button = -1;
    mouse.pixelRatio = parseInt(mouse.element.getAttribute('data-pixel-ratio'), 10) || 1;

    mouse.sourceEvents = {
        mousemove: null,
        mousedown: null,
        mouseup: null,
        mousewheel: null
    };

    mouse.mousemove = function (event) {
        var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),
            touches = event.changedTouches;

        if (touches) {
            mouse.button = 0;
            event.preventDefault();
        }

        mouse.absolute.x = position.x;
        mouse.absolute.y = position.y;
        mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
        mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
        mouse.sourceEvents.mousemove = event;
    };

    mouse.mousedown = function (event) {
        var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),
            touches = event.changedTouches;

        if (touches) {
            mouse.button = 0;
            event.preventDefault();
        } else {
            mouse.button = event.button;
        }

        mouse.absolute.x = position.x;
        mouse.absolute.y = position.y;
        mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
        mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
        mouse.mousedownPosition.x = mouse.position.x;
        mouse.mousedownPosition.y = mouse.position.y;
        mouse.sourceEvents.mousedown = event;
    };

    mouse.mouseup = function (event) {
        var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),
            touches = event.changedTouches;

        if (touches) {
            event.preventDefault();
        }

        mouse.button = -1;
        mouse.absolute.x = position.x;
        mouse.absolute.y = position.y;
        mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
        mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
        mouse.mouseupPosition.x = mouse.position.x;
        mouse.mouseupPosition.y = mouse.position.y;
        mouse.sourceEvents.mouseup = event;
    };

    mouse.mousewheel = function (event) {
        mouse.wheelDelta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
        event.preventDefault();
    };

    Mouse.setElement(mouse, mouse.element);

    return mouse;
};


Mouse.setElement = function (mouse, element) {
    mouse.element = element;

    element.addEventListener('mousemove', mouse.mousemove);
    element.addEventListener('mousedown', mouse.mousedown);
    element.addEventListener('mouseup', mouse.mouseup);

    element.addEventListener('mousewheel', mouse.mousewheel);
    element.addEventListener('DOMMouseScroll', mouse.mousewheel);

    element.addEventListener('touchmove', mouse.mousemove);
    element.addEventListener('touchstart', mouse.mousedown);
    element.addEventListener('touchend', mouse.mouseup);
};


Mouse.clearSourceEvents = function (mouse) {
    mouse.sourceEvents.mousemove = null;
    mouse.sourceEvents.mousedown = null;
    mouse.sourceEvents.mouseup = null;
    mouse.sourceEvents.mousewheel = null;
    mouse.wheelDelta = 0;
};


Mouse.setOffset = function (mouse, offset) {
    mouse.offset.x = offset.x;
    mouse.offset.y = offset.y;
    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
};


Mouse.setScale = function (mouse, scale) {
    mouse.scale.x = scale.x;
    mouse.scale.y = scale.y;
    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
};

Mouse._getRelativeMousePosition = function (event, element, pixelRatio) {
    var elementBounds = element.getBoundingClientRect(),
        rootNode = (document.documentElement || document.body.parentNode || document.body),
        scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : rootNode.scrollLeft,
        scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : rootNode.scrollTop,
        touches = event.changedTouches,
        x, y;

    if (touches) {
        x = touches[0].pageX - elementBounds.left - scrollX;
        y = touches[0].pageY - elementBounds.top - scrollY;
    } else {
        x = event.pageX - elementBounds.left - scrollX;
        y = event.pageY - elementBounds.top - scrollY;
    }

    return {
        x: x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio),
        y: y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio)
    };
};

var Detector = {};

Detector.collisions = function (broadphasePairs, engine) {
    var collisions = [],
        pairsTable = engine.pairs.table;

    for (var i = 0; i < broadphasePairs.length; i++) {
        var bodyA = broadphasePairs[i][0],
            bodyB = broadphasePairs[i][1];

        if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
            continue;

        if (!Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter))
            continue;


        if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {
            for (var j = bodyA.parts.length > 1 ? 1 : 0; j < bodyA.parts.length; j++) {
                var partA = bodyA.parts[j];

                for (var k = bodyB.parts.length > 1 ? 1 : 0; k < bodyB.parts.length; k++) {
                    var partB = bodyB.parts[k];

                    if ((partA === bodyA && partB === bodyB) || Bounds.overlaps(partA.bounds, partB.bounds)) {

                        var pairId = Pair.id(partA, partB),
                            pair = pairsTable[pairId],
                            previousCollision;

                        if (pair && pair.isActive) {
                            previousCollision = pair.collision;
                        } else {
                            previousCollision = null;
                        }


                        var collision = SAT.collides(partA, partB, previousCollision);

                        if (collision.collided) {
                            collisions.push(collision);
                        }
                    }
                }
            }
        }
    }

    return collisions;
};

Detector.canCollide = function (filterA, filterB) {
    if (filterA.group === filterB.group && filterA.group !== 0)
        return filterA.group > 0;

    return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
};

var SAT = {};

SAT.collides = function (bodyA, bodyB, previousCollision) {
    var overlapAB,
        overlapBA,
        minOverlap,
        collision,
        canReusePrevCol = false;

    if (previousCollision) {

        var parentA = bodyA.parent,
            parentB = bodyB.parent,
            motion = parentA.speed * parentA.speed + parentA.angularSpeed * parentA.angularSpeed +
            parentB.speed * parentB.speed + parentB.angularSpeed * parentB.angularSpeed;



        canReusePrevCol = previousCollision && previousCollision.collided && motion < 0.2;


        collision = previousCollision;
    } else {
        collision = {
            collided: false,
            bodyA: bodyA,
            bodyB: bodyB
        };
    }

    if (previousCollision && canReusePrevCol) {


        var axisBodyA = collision.axisBody,
            axisBodyB = axisBodyA === bodyA ? bodyB : bodyA,
            axes = [axisBodyA.axes[previousCollision.axisNumber]];

        minOverlap = SAT._overlapAxes(axisBodyA.vertices, axisBodyB.vertices, axes);
        collision.reused = true;

        if (minOverlap.overlap <= 0) {
            collision.collided = false;
            return collision;
        }
    } else {


        overlapAB = SAT._overlapAxes(bodyA.vertices, bodyB.vertices, bodyA.axes);

        if (overlapAB.overlap <= 0) {
            collision.collided = false;
            return collision;
        }

        overlapBA = SAT._overlapAxes(bodyB.vertices, bodyA.vertices, bodyB.axes);

        if (overlapBA.overlap <= 0) {
            collision.collided = false;
            return collision;
        }

        if (overlapAB.overlap < overlapBA.overlap) {
            minOverlap = overlapAB;
            collision.axisBody = bodyA;
        } else {
            minOverlap = overlapBA;
            collision.axisBody = bodyB;
        }


        collision.axisNumber = minOverlap.axisNumber;
    }

    collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
    collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
    collision.collided = true;
    collision.depth = minOverlap.overlap;
    collision.parentA = collision.bodyA.parent;
    collision.parentB = collision.bodyB.parent;

    bodyA = collision.bodyA;
    bodyB = collision.bodyB;


    if (Vector.dot(minOverlap.axis, Vector.sub(bodyB.position, bodyA.position)) < 0) {
        collision.normal = {
            x: minOverlap.axis.x,
            y: minOverlap.axis.y
        };
    } else {
        collision.normal = {
            x: -minOverlap.axis.x,
            y: -minOverlap.axis.y
        };
    }

    collision.tangent = Vector.perp(collision.normal);

    collision.penetration = collision.penetration || {};
    collision.penetration.x = collision.normal.x * collision.depth;
    collision.penetration.y = collision.normal.y * collision.depth;


    var verticesB = SAT._findSupports(bodyA, bodyB, collision.normal),
        supports = [];


    if (Vertices.contains(bodyA.vertices, verticesB[0]))
        supports.push(verticesB[0]);

    if (Vertices.contains(bodyA.vertices, verticesB[1]))
        supports.push(verticesB[1]);


    if (supports.length < 2) {
        var verticesA = SAT._findSupports(bodyB, bodyA, Vector.neg(collision.normal));

        if (Vertices.contains(bodyB.vertices, verticesA[0]))
            supports.push(verticesA[0]);

        if (supports.length < 2 && Vertices.contains(bodyB.vertices, verticesA[1]))
            supports.push(verticesA[1]);
    }


    if (supports.length < 1)
        supports = [verticesB[0]];

    collision.supports = supports;

    return collision;
};

SAT._overlapAxes = function (verticesA, verticesB, axes) {
    var projectionA = Vector._temp[0],
        projectionB = Vector._temp[1],
        result = {
            overlap: Number.MAX_VALUE
        },
        overlap,
        axis;

    for (var i = 0; i < axes.length; i++) {
        axis = axes[i];

        SAT._projectToAxis(projectionA, verticesA, axis);
        SAT._projectToAxis(projectionB, verticesB, axis);

        overlap = Math.min(projectionA.max - projectionB.min, projectionB.max - projectionA.min);

        if (overlap <= 0) {
            result.overlap = overlap;
            return result;
        }

        if (overlap < result.overlap) {
            result.overlap = overlap;
            result.axis = axis;
            result.axisNumber = i;
        }
    }

    return result;
};

SAT._projectToAxis = function (projection, vertices, axis) {
    var min = Vector.dot(vertices[0], axis),
        max = min;

    for (var i = 1; i < vertices.length; i += 1) {
        var dot = Vector.dot(vertices[i], axis);

        if (dot > max) {
            max = dot;
        } else if (dot < min) {
            min = dot;
        }
    }

    projection.min = min;
    projection.max = max;
};

SAT._findSupports = function (bodyA, bodyB, normal) {
    var nearestDistance = Number.MAX_VALUE,
        vertexToBody = Vector._temp[0],
        vertices = bodyB.vertices,
        bodyAPosition = bodyA.position,
        distance,
        vertex,
        vertexA,
        vertexB;


    for (var i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        vertexToBody.x = vertex.x - bodyAPosition.x;
        vertexToBody.y = vertex.y - bodyAPosition.y;
        distance = -Vector.dot(normal, vertexToBody);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            vertexA = vertex;
        }
    }


    var prevIndex = vertexA.index - 1 >= 0 ? vertexA.index - 1 : vertices.length - 1;
    vertex = vertices[prevIndex];
    vertexToBody.x = vertex.x - bodyAPosition.x;
    vertexToBody.y = vertex.y - bodyAPosition.y;
    nearestDistance = -Vector.dot(normal, vertexToBody);
    vertexB = vertex;

    var nextIndex = (vertexA.index + 1) % vertices.length;
    vertex = vertices[nextIndex];
    vertexToBody.x = vertex.x - bodyAPosition.x;
    vertexToBody.y = vertex.y - bodyAPosition.y;
    distance = -Vector.dot(normal, vertexToBody);
    if (distance < nearestDistance) {
        vertexB = vertex;
    }

    return [vertexA, vertexB];
};

var Render = {};

var _requestAnimationFrame,
    _cancelAnimationFrame;

if (typeof window !== 'undefined') {
    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(function () {
                callback(Common.now());
            }, 1000 / 60);
        };

    _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame ||
        window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
}

Render._goodFps = 30;
Render._goodDelta = 1000 / 60;

Render.create = function (options) {
    var defaults = {
        controller: Render,
        engine: null,
        element: null,
        canvas: null,
        mouse: null,
        frameRequestId: null,
        timing: {
            historySize: 60,
            delta: 0,
            deltaHistory: [],
            lastTime: 0,
            lastTimestamp: 0,
            lastElapsed: 0,
            timestampElapsed: 0,
            timestampElapsedHistory: [],
            engineDeltaHistory: [],
            engineElapsedHistory: [],
            elapsedHistory: []
        },
        options: {
            width: 800,
            height: 600,
            pixelRatio: 1,
            background: '#14151f',
            wireframeBackground: '#14151f',
            hasBounds: !!options.bounds,
            enabled: true,
            wireframes: true,
        }
    };

    var render = Common.extend(defaults, options);

    if (render.canvas) {
        render.canvas.width = render.options.width || render.canvas.width;
        render.canvas.height = render.options.height || render.canvas.height;
    }

    render.mouse = options.mouse;
    render.engine = options.engine;
    render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
    render.context = render.canvas.getContext('2d');

    render.bounds = render.bounds || {
        min: {
            x: 0,
            y: 0
        },
        max: {
            x: render.canvas.width,
            y: render.canvas.height
        }
    };

    if (Common.isElement(render.element)) {
        render.element.appendChild(render.canvas);
    } else if (!render.canvas.parentNode) {
        Common.log('Render.create: options.element was undefined, render.canvas was created but not appended', 'warn');
    }

    return render;
};

Render.run = function (render) {
    (function loop(time) {
        render.frameRequestId = _requestAnimationFrame(loop);

        _updateTiming(render, time);

        Render.world(render, time);
    })();
};

Render.stop = function (render) {
    _cancelAnimationFrame(render.frameRequestId);
};

Render.startViewTransform = function (render) {
    var boundsWidth = render.bounds.max.x - render.bounds.min.x,
        boundsHeight = render.bounds.max.y - render.bounds.min.y,
        boundsScaleX = boundsWidth / render.options.width,
        boundsScaleY = boundsHeight / render.options.height;

    render.context.setTransform(
        render.options.pixelRatio / boundsScaleX, 0, 0,
        render.options.pixelRatio / boundsScaleY, 0, 0
    );

    render.context.translate(-render.bounds.min.x, -render.bounds.min.y);
};

Render.endViewTransform = function (render) {
    render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
};

Render.world = function (render, time) {
    var startTime = Common.now(),
        engine = render.engine,
        world = engine.world,
        canvas = render.canvas,
        context = render.context,
        options = render.options,
        timing = render.timing;

    var allBodies = Composite.allBodies(world),

        background = options.wireframes ? options.wireframeBackground : options.background,
        bodies = [],
        i;

    var event = {
        timestamp: engine.timing.timestamp
    };

    Events.trigger(render, 'beforeRender', event);


    if (render.currentBackground !== background)
        _applyBackground(render, background);


    context.globalCompositeOperation = 'source-in';
    context.fillStyle = "transparent";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'source-over';


    if (options.hasBounds) {

        for (i = 0; i < allBodies.length; i++) {
            var body = allBodies[i];
            if (Bounds.overlaps(body.bounds, render.bounds))
                bodies.push(body);
        }


        Render.startViewTransform(render);


        if (render.mouse) {
            Mouse.setScale(render.mouse, {
                x: (render.bounds.max.x - render.bounds.min.x) / render.options.width,
                y: (render.bounds.max.y - render.bounds.min.y) / render.options.height
            });

            Mouse.setOffset(render.mouse, render.bounds.min);
        }
    } else {

        bodies = allBodies;

        if (render.options.pixelRatio !== 1) {
            render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
        }
    }

    if (!options.wireframes || (engine.enableSleeping && options.showSleeping)) {

        Render.bodies(render, bodies, context);
    } else {
        if (options.showConvexHulls)
            Render.bodyConvexHulls(render, bodies, context);


        Render.bodyWireframes(render, bodies, context);
    }

    if (options.showBroadphase)
        Render.grid(render, engine.grid, context);

    if (options.hasBounds) {

        Render.endViewTransform(render);
    }

    Events.trigger(render, 'afterRender', event);


    timing.lastElapsed = Common.now() - startTime;
};

Render.bodies = function (render, bodies, context) {
    var c = context,
        engine = render.engine,
        options = render.options,
        showInternalEdges = options.showInternalEdges || !options.wireframes,
        body,
        part,
        i,
        k;

    for (i = 0; i < bodies.length; i++) {
        body = bodies[i];

        if (!body.render.visible)
            continue;


        for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
            part = body.parts[k];

            if (!part.render.visible)
                continue;

            if (options.showSleeping && body.isSleeping) {
                c.globalAlpha = 0.5 * part.render.opacity;
            } else if (part.render.opacity !== 1) {
                c.globalAlpha = part.render.opacity;
            }

            if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {

                var sprite = part.render.sprite,
                    texture = _getTexture(render, sprite.texture);

                c.translate(part.position.x, part.position.y);
                c.rotate(part.angle);

                c.drawImage(
                    texture,
                    texture.width * -sprite.xOffset * sprite.xScale,
                    texture.height * -sprite.yOffset * sprite.yScale,
                    texture.width * sprite.xScale,
                    texture.height * sprite.yScale
                );


                c.rotate(-part.angle);
                c.translate(-part.position.x, -part.position.y);
            } else {

                if (part.circleRadius) {
                    c.beginPath();
                    c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                } else {
                    c.beginPath();
                    c.moveTo(part.vertices[0].x, part.vertices[0].y);

                    for (var j = 1; j < part.vertices.length; j++) {
                        if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                            c.lineTo(part.vertices[j].x, part.vertices[j].y);
                        } else {
                            c.moveTo(part.vertices[j].x, part.vertices[j].y);
                        }

                        if (part.vertices[j].isInternal && !showInternalEdges) {
                            c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                        }
                    }

                    c.lineTo(part.vertices[0].x, part.vertices[0].y);
                    c.closePath();
                }

                if (!options.wireframes) {
                    c.fillStyle = part.render.fillStyle;

                    if (part.render.lineWidth) {
                        c.lineWidth = part.render.lineWidth;
                        c.strokeStyle = part.render.strokeStyle;
                        c.stroke();
                    }

                    c.fill();
                } else {
                    c.lineWidth = 1;
                    c.strokeStyle = '#bbb';
                    c.stroke();
                }
            }

            c.globalAlpha = 1;
        }
    }
};

var _updateTiming = function (render, time) {
    var engine = render.engine,
        timing = render.timing,
        historySize = timing.historySize,
        timestamp = engine.timing.timestamp;

    timing.delta = time - timing.lastTime || Render._goodDelta;
    timing.lastTime = time;

    timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;
    timing.lastTimestamp = timestamp;

    timing.deltaHistory.unshift(timing.delta);
    timing.deltaHistory.length = Math.min(timing.deltaHistory.length, historySize);

    timing.engineDeltaHistory.unshift(engine.timing.lastDelta);
    timing.engineDeltaHistory.length = Math.min(timing.engineDeltaHistory.length, historySize);

    timing.timestampElapsedHistory.unshift(timing.timestampElapsed);
    timing.timestampElapsedHistory.length = Math.min(timing.timestampElapsedHistory.length, historySize);

    timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);
    timing.engineElapsedHistory.length = Math.min(timing.engineElapsedHistory.length, historySize);

    timing.elapsedHistory.unshift(timing.lastElapsed);
    timing.elapsedHistory.length = Math.min(timing.elapsedHistory.length, historySize);
};

var _applyBackground = function (render, background) {
    var cssBackground = background;

    render.canvas.style.background = cssBackground;
    render.canvas.style.backgroundSize = "contain";
    render.currentBackground = background;
};

var Contact = {};

Contact.create = function (vertex) {
    return {
        id: Contact.id(vertex),
        vertex: vertex,
        normalImpulse: 0,
        tangentImpulse: 0
    };
};


Contact.id = function (vertex) {
    return vertex.body.id + '_' + vertex.index;
};

var Engine = {};

Engine.create = function (options) {
    options = options || {};

    var defaults = {
        positionIterations: 6,
        velocityIterations: 4,
        constraintIterations: 2,
        enableSleeping: false,
        events: [],
        plugin: {},
        grid: null,
        gravity: {
            x: 0,
            y: 1,
            scale: 0.001
        },
        timing: {
            timestamp: 0,
            timeScale: 1,
            lastDelta: 0,
            lastElapsed: 0
        }
    };

    var engine = Common.extend(defaults, options);

    engine.world = options.world || Composite.create({
        label: 'World'
    });
    engine.grid = Grid.create(options.grid || options.broadphase);
    engine.pairs = Pairs.create();


    engine.world.gravity = engine.gravity;
    engine.broadphase = engine.grid;
    engine.metrics = {};

    return engine;
};

Engine.update = function (engine, delta, correction) {
    var startTime = Common.now();

    delta = delta || 1000 / 60;
    correction = correction || 1;

    var world = engine.world,
        timing = engine.timing,
        grid = engine.grid,
        gridPairs = [],
        i;

    timing.timestamp += delta * timing.timeScale;
    timing.lastDelta = delta * timing.timeScale;

    var event = {
        timestamp: timing.timestamp
    };

    Events.trigger(engine, 'beforeUpdate', event);

    var allBodies = Composite.allBodies(world);

    if (engine.enableSleeping)
        Sleeping.update(allBodies, timing.timeScale);


    Engine._bodiesApplyGravity(allBodies, engine.gravity);

    Engine._bodiesUpdate(allBodies, delta, timing.timeScale, correction, world.bounds);

    if (world.isModified)
        Grid.clear(grid);


    Grid.update(grid, allBodies, engine, world.isModified);
    gridPairs = grid.pairsList;


    if (world.isModified) {
        Composite.setModified(world, false, false, true);
    }


    var collisions = Detector.collisions(gridPairs, engine);


    var pairs = engine.pairs,
        timestamp = timing.timestamp;
    Pairs.update(pairs, collisions, timestamp);
    Pairs.removeOld(pairs, timestamp);


    if (engine.enableSleeping)
        Sleeping.afterCollisions(pairs.list, timing.timeScale);


    if (pairs.collisionStart.length > 0)
        Events.trigger(engine, 'collisionStart', {
            pairs: pairs.collisionStart
        });


    Resolver.preSolvePosition(pairs.list);
    for (i = 0; i < engine.positionIterations; i++) {
        Resolver.solvePosition(pairs.list, timing.timeScale);
    }
    Resolver.postSolvePosition(allBodies);

    Resolver.preSolveVelocity(pairs.list);
    for (i = 0; i < engine.velocityIterations; i++) {
        Resolver.solveVelocity(pairs.list, timing.timeScale);
    }

    if (pairs.collisionActive.length > 0)
        Events.trigger(engine, 'collisionActive', {
            pairs: pairs.collisionActive
        });

    if (pairs.collisionEnd.length > 0)
        Events.trigger(engine, 'collisionEnd', {
            pairs: pairs.collisionEnd
        });

    Engine._bodiesClearForces(allBodies);

    Events.trigger(engine, 'afterUpdate', event);


    engine.timing.lastElapsed = Common.now() - startTime;

    MatterAttractors.Engine.update(engine);

    return engine;
};


Engine.merge = function (engineA, engineB) {
    Common.extend(engineA, engineB);

    if (engineB.world) {
        engineA.world = engineB.world;

        Engine.clear(engineA);

        var bodies = Composite.allBodies(engineA.world);

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            Sleeping.set(body, false);
            body.id = Common.nextId();
        }
    }
};


Engine.clear = function (engine) {
    var world = engine.world,
        bodies = Composite.allBodies(world);

    Pairs.clear(engine.pairs);
    Grid.clear(engine.grid);
    Grid.update(engine.grid, bodies, engine, true);
};


Engine._bodiesClearForces = function (bodies) {
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];


        body.force.x = 0;
        body.force.y = 0;
        body.torque = 0;
    }
};


Engine._bodiesApplyGravity = function (bodies, gravity) {
    var gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001;

    if ((gravity.x === 0 && gravity.y === 0) || gravityScale === 0) {
        return;
    }

    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];

        if (body.isStatic || body.isSleeping)
            continue;


        body.force.y += body.mass * gravity.y * gravityScale;
        body.force.x += body.mass * gravity.x * gravityScale;
    }
};


Engine._bodiesUpdate = function (bodies, deltaTime, timeScale, correction, worldBounds) {
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];

        if (body.isStatic || body.isSleeping)
            continue;

        Body.update(body, deltaTime, timeScale, correction);
    }
};

var Resolver = {};

Resolver._restingThresh = 4;
Resolver._restingThreshTangent = 6;
Resolver._positionDampen = 0.9;
Resolver._positionWarming = 0.8;
Resolver._frictionNormalMultiplier = 5;


Resolver.preSolvePosition = function (pairs) {
    var i,
        pair,
        activeCount;


    for (i = 0; i < pairs.length; i++) {
        pair = pairs[i];

        if (!pair.isActive)
            continue;

        activeCount = pair.activeContacts.length;
        pair.collision.parentA.totalContacts += activeCount;
        pair.collision.parentB.totalContacts += activeCount;
    }
};


Resolver.solvePosition = function (pairs, timeScale) {
    var i,
        pair,
        collision,
        bodyA,
        bodyB,
        normal,
        bodyBtoA,
        contactShare,
        positionImpulse,
        contactCount = {},
        tempA = Vector._temp[0],
        tempB = Vector._temp[1],
        tempC = Vector._temp[2],
        tempD = Vector._temp[3];


    for (i = 0; i < pairs.length; i++) {
        pair = pairs[i];

        if (!pair.isActive || pair.isSensor)
            continue;

        collision = pair.collision;
        bodyA = collision.parentA;
        bodyB = collision.parentB;
        normal = collision.normal;


        bodyBtoA = Vector.sub(Vector.add(bodyB.positionImpulse, bodyB.position, tempA),
            Vector.add(bodyA.positionImpulse,
                Vector.sub(bodyB.position, collision.penetration, tempB), tempC), tempD);

        pair.separation = Vector.dot(normal, bodyBtoA);
    }

    for (i = 0; i < pairs.length; i++) {
        pair = pairs[i];

        if (!pair.isActive || pair.isSensor)
            continue;

        collision = pair.collision;
        bodyA = collision.parentA;
        bodyB = collision.parentB;
        normal = collision.normal;
        positionImpulse = (pair.separation - pair.slop) * timeScale;

        if (bodyA.isStatic || bodyB.isStatic)
            positionImpulse *= 2;

        if (!(bodyA.isStatic || bodyA.isSleeping)) {
            contactShare = Resolver._positionDampen / bodyA.totalContacts;
            bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
            bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
        }

        if (!(bodyB.isStatic || bodyB.isSleeping)) {
            contactShare = Resolver._positionDampen / bodyB.totalContacts;
            bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
            bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
        }
    }
};


Resolver.postSolvePosition = function (bodies) {
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];


        body.totalContacts = 0;

        if (body.positionImpulse.x !== 0 || body.positionImpulse.y !== 0) {

            for (var j = 0; j < body.parts.length; j++) {
                var part = body.parts[j];
                Vertices.translate(part.vertices, body.positionImpulse);
                Bounds.update(part.bounds, part.vertices, body.velocity);
                part.position.x += body.positionImpulse.x;
                part.position.y += body.positionImpulse.y;
            }


            body.positionPrev.x += body.positionImpulse.x;
            body.positionPrev.y += body.positionImpulse.y;

            if (Vector.dot(body.positionImpulse, body.velocity) < 0) {

                body.positionImpulse.x = 0;
                body.positionImpulse.y = 0;
            } else {

                body.positionImpulse.x *= Resolver._positionWarming;
                body.positionImpulse.y *= Resolver._positionWarming;
            }
        }
    }
};


Resolver.preSolveVelocity = function (pairs) {
    var i,
        j,
        pair,
        contacts,
        collision,
        bodyA,
        bodyB,
        normal,
        tangent,
        contact,
        contactVertex,
        normalImpulse,
        tangentImpulse,
        offset,
        impulse = Vector._temp[0],
        tempA = Vector._temp[1];

    for (i = 0; i < pairs.length; i++) {
        pair = pairs[i];

        if (!pair.isActive || pair.isSensor)
            continue;

        contacts = pair.activeContacts;
        collision = pair.collision;
        bodyA = collision.parentA;
        bodyB = collision.parentB;
        normal = collision.normal;
        tangent = collision.tangent;


        for (j = 0; j < contacts.length; j++) {
            contact = contacts[j];
            contactVertex = contact.vertex;
            normalImpulse = contact.normalImpulse;
            tangentImpulse = contact.tangentImpulse;

            if (normalImpulse !== 0 || tangentImpulse !== 0) {

                impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);


                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    offset = Vector.sub(contactVertex, bodyA.position, tempA);
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offset, impulse) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    offset = Vector.sub(contactVertex, bodyB.position, tempA);
                    bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                    bodyB.anglePrev -= Vector.cross(offset, impulse) * bodyB.inverseInertia;
                }
            }
        }
    }
};


Resolver.solveVelocity = function (pairs, timeScale) {
    var timeScaleSquared = timeScale * timeScale,
        impulse = Vector._temp[0],
        tempA = Vector._temp[1],
        tempB = Vector._temp[2],
        tempC = Vector._temp[3],
        tempD = Vector._temp[4],
        tempE = Vector._temp[5];

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];

        if (!pair.isActive || pair.isSensor)
            continue;

        var collision = pair.collision,
            bodyA = collision.parentA,
            bodyB = collision.parentB,
            normal = collision.normal,
            tangent = collision.tangent,
            contacts = pair.activeContacts,
            contactShare = 1 / contacts.length;


        bodyA.velocity.x = bodyA.position.x - bodyA.positionPrev.x;
        bodyA.velocity.y = bodyA.position.y - bodyA.positionPrev.y;
        bodyB.velocity.x = bodyB.position.x - bodyB.positionPrev.x;
        bodyB.velocity.y = bodyB.position.y - bodyB.positionPrev.y;
        bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;
        bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;


        for (var j = 0; j < contacts.length; j++) {
            var contact = contacts[j],
                contactVertex = contact.vertex,
                offsetA = Vector.sub(contactVertex, bodyA.position, tempA),
                offsetB = Vector.sub(contactVertex, bodyB.position, tempB),
                velocityPointA = Vector.add(bodyA.velocity, Vector.mult(Vector.perp(offsetA), bodyA.angularVelocity), tempC),
                velocityPointB = Vector.add(bodyB.velocity, Vector.mult(Vector.perp(offsetB), bodyB.angularVelocity), tempD),
                relativeVelocity = Vector.sub(velocityPointA, velocityPointB, tempE),
                normalVelocity = Vector.dot(normal, relativeVelocity);

            var tangentVelocity = Vector.dot(tangent, relativeVelocity),
                tangentSpeed = Math.abs(tangentVelocity),
                tangentVelocityDirection = Common.sign(tangentVelocity);


            var normalImpulse = (1 + pair.restitution) * normalVelocity,
                normalForce = Common.clamp(pair.separation + normalVelocity, 0, 1) * Resolver._frictionNormalMultiplier;


            var tangentImpulse = tangentVelocity,
                maxFriction = Infinity;

            if (tangentSpeed > pair.friction * pair.frictionStatic * normalForce * timeScaleSquared) {
                maxFriction = tangentSpeed;
                tangentImpulse = Common.clamp(
                    pair.friction * tangentVelocityDirection * timeScaleSquared,
                    -maxFriction, maxFriction
                );
            }


            var oAcN = Vector.cross(offsetA, normal),
                oBcN = Vector.cross(offsetB, normal),
                share = contactShare / (bodyA.inverseMass + bodyB.inverseMass + bodyA.inverseInertia * oAcN * oAcN + bodyB.inverseInertia * oBcN * oBcN);

            normalImpulse *= share;
            tangentImpulse *= share;


            if (normalVelocity < 0 && normalVelocity * normalVelocity > Resolver._restingThresh * timeScaleSquared) {

                contact.normalImpulse = 0;
            } else {


                var contactNormalImpulse = contact.normalImpulse;
                contact.normalImpulse = Math.min(contact.normalImpulse + normalImpulse, 0);
                normalImpulse = contact.normalImpulse - contactNormalImpulse;
            }


            if (tangentVelocity * tangentVelocity > Resolver._restingThreshTangent * timeScaleSquared) {

                contact.tangentImpulse = 0;
            } else {


                var contactTangentImpulse = contact.tangentImpulse;
                contact.tangentImpulse = Common.clamp(contact.tangentImpulse + tangentImpulse, -maxFriction, maxFriction);
                tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
            }


            impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
            impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);


            if (!(bodyA.isStatic || bodyA.isSleeping)) {
                bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                bodyA.anglePrev += Vector.cross(offsetA, impulse) * bodyA.inverseInertia;
            }

            if (!(bodyB.isStatic || bodyB.isSleeping)) {
                bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                bodyB.anglePrev -= Vector.cross(offsetB, impulse) * bodyB.inverseInertia;
            }
        }
    }
};

var Pairs = {};

Pairs._pairMaxIdleLife = 1000;


Pairs.create = function (options) {
    return Common.extend({
        table: {},
        list: [],
        collisionStart: [],
        collisionActive: [],
        collisionEnd: []
    }, options);
};


Pairs.update = function (pairs, collisions, timestamp) {
    var pairsList = pairs.list,
        pairsTable = pairs.table,
        collisionStart = pairs.collisionStart,
        collisionEnd = pairs.collisionEnd,
        collisionActive = pairs.collisionActive,
        collision,
        pairId,
        pair,
        i;


    collisionStart.length = 0;
    collisionEnd.length = 0;
    collisionActive.length = 0;

    for (i = 0; i < pairsList.length; i++) {
        pairsList[i].confirmedActive = false;
    }

    for (i = 0; i < collisions.length; i++) {
        collision = collisions[i];

        if (collision.collided) {
            pairId = Pair.id(collision.bodyA, collision.bodyB);

            pair = pairsTable[pairId];

            if (pair) {

                if (pair.isActive) {

                    collisionActive.push(pair);
                } else {

                    collisionStart.push(pair);
                }


                Pair.update(pair, collision, timestamp);
                pair.confirmedActive = true;
            } else {

                pair = Pair.create(collision, timestamp);
                pairsTable[pairId] = pair;


                collisionStart.push(pair);
                pairsList.push(pair);
            }
        }
    }


    for (i = 0; i < pairsList.length; i++) {
        pair = pairsList[i];
        if (pair.isActive && !pair.confirmedActive) {
            Pair.setActive(pair, false, timestamp);
            collisionEnd.push(pair);
        }
    }
};


Pairs.removeOld = function (pairs, timestamp) {
    var pairsList = pairs.list,
        pairsTable = pairs.table,
        indexesToRemove = [],
        pair,
        collision,
        pairIndex,
        i;

    for (i = 0; i < pairsList.length; i++) {
        pair = pairsList[i];
        collision = pair.collision;


        if (collision.bodyA.isSleeping || collision.bodyB.isSleeping) {
            pair.timeUpdated = timestamp;
            continue;
        }


        if (timestamp - pair.timeUpdated > Pairs._pairMaxIdleLife) {
            indexesToRemove.push(i);
        }
    }


    for (i = 0; i < indexesToRemove.length; i++) {
        pairIndex = indexesToRemove[i] - i;
        pair = pairsList[pairIndex];
        delete pairsTable[pair.id];
        pairsList.splice(pairIndex, 1);
    }
};


Pairs.clear = function (pairs) {
    pairs.table = {};
    pairs.list.length = 0;
    pairs.collisionStart.length = 0;
    pairs.collisionActive.length = 0;
    pairs.collisionEnd.length = 0;
    return pairs;
};

var Grid = {};


Grid.create = function (options) {
    var defaults = {
        buckets: {},
        pairs: {},
        pairsList: [],
        bucketWidth: 48,
        bucketHeight: 48
    };

    return Common.extend(defaults, options);
};

Grid.update = function (grid, bodies, engine, forceUpdate) {
    var i, col, row,
        world = engine.world,
        buckets = grid.buckets,
        bucket,
        bucketId,
        gridChanged = false;

    for (i = 0; i < bodies.length; i++) {
        var body = bodies[i];

        if (body.isSleeping && !forceUpdate)
            continue;


        if (world.bounds && (body.bounds.max.x < world.bounds.min.x || body.bounds.min.x > world.bounds.max.x ||
                body.bounds.max.y < world.bounds.min.y || body.bounds.min.y > world.bounds.max.y))
            continue;

        var newRegion = Grid._getRegion(grid, body);


        if (!body.region || newRegion.id !== body.region.id || forceUpdate) {

            if (!body.region || forceUpdate)
                body.region = newRegion;

            var union = Grid._regionUnion(newRegion, body.region);



            for (col = union.startCol; col <= union.endCol; col++) {
                for (row = union.startRow; row <= union.endRow; row++) {
                    bucketId = Grid._getBucketId(col, row);
                    bucket = buckets[bucketId];

                    var isInsideNewRegion = (col >= newRegion.startCol && col <= newRegion.endCol &&
                        row >= newRegion.startRow && row <= newRegion.endRow);

                    var isInsideOldRegion = (col >= body.region.startCol && col <= body.region.endCol &&
                        row >= body.region.startRow && row <= body.region.endRow);


                    if (!isInsideNewRegion && isInsideOldRegion) {
                        if (isInsideOldRegion) {
                            if (bucket)
                                Grid._bucketRemoveBody(grid, bucket, body);
                        }
                    }


                    if (body.region === newRegion || (isInsideNewRegion && !isInsideOldRegion) || forceUpdate) {
                        if (!bucket)
                            bucket = Grid._createBucket(buckets, bucketId);
                        Grid._bucketAddBody(grid, bucket, body);
                    }
                }
            }


            body.region = newRegion;


            gridChanged = true;
        }
    }


    if (gridChanged)
        grid.pairsList = Grid._createActivePairsList(grid);
};


Grid.clear = function (grid) {
    grid.buckets = {};
    grid.pairs = {};
    grid.pairsList = [];
};

Grid._regionUnion = function (regionA, regionB) {
    var startCol = Math.min(regionA.startCol, regionB.startCol),
        endCol = Math.max(regionA.endCol, regionB.endCol),
        startRow = Math.min(regionA.startRow, regionB.startRow),
        endRow = Math.max(regionA.endRow, regionB.endRow);

    return Grid._createRegion(startCol, endCol, startRow, endRow);
};

Grid._getRegion = function (grid, body) {
    var bounds = body.bounds,
        startCol = Math.floor(bounds.min.x / grid.bucketWidth),
        endCol = Math.floor(bounds.max.x / grid.bucketWidth),
        startRow = Math.floor(bounds.min.y / grid.bucketHeight),
        endRow = Math.floor(bounds.max.y / grid.bucketHeight);

    return Grid._createRegion(startCol, endCol, startRow, endRow);
};

Grid._createRegion = function (startCol, endCol, startRow, endRow) {
    return {
        id: startCol + ',' + endCol + ',' + startRow + ',' + endRow,
        startCol: startCol,
        endCol: endCol,
        startRow: startRow,
        endRow: endRow
    };
};

Grid._getBucketId = function (column, row) {
    return 'C' + column + 'R' + row;
};

Grid._createBucket = function (buckets, bucketId) {
    var bucket = buckets[bucketId] = [];
    return bucket;
};

Grid._bucketAddBody = function (grid, bucket, body) {

    for (var i = 0; i < bucket.length; i++) {
        var bodyB = bucket[i];

        if (body.id === bodyB.id || (body.isStatic && bodyB.isStatic))
            continue;



        var pairId = Pair.id(body, bodyB),
            pair = grid.pairs[pairId];

        if (pair) {
            pair[2] += 1;
        } else {
            grid.pairs[pairId] = [body, bodyB, 1];
        }
    }


    bucket.push(body);
};

Grid._bucketRemoveBody = function (grid, bucket, body) {

    bucket.splice(Common.indexOf(bucket, body), 1);


    for (var i = 0; i < bucket.length; i++) {


        var bodyB = bucket[i],
            pairId = Pair.id(body, bodyB),
            pair = grid.pairs[pairId];

        if (pair)
            pair[2] -= 1;
    }
};

Grid._createActivePairsList = function (grid) {
    var pairKeys,
        pair,
        pairs = [];


    pairKeys = Common.keys(grid.pairs);


    for (var k = 0; k < pairKeys.length; k++) {
        pair = grid.pairs[pairKeys[k]];



        if (pair[2] > 0) {
            pairs.push(pair);
        } else {
            delete grid.pairs[pairKeys[k]];
        }
    }

    return pairs;
};

var Matter = {};

Matter.name = 'matter-js';

Matter.version = "0.17.1";

Matter.uses = [];

Matter.used = [];

Matter.use = function () {
    Plugin.use(Matter, Array.prototype.slice.call(arguments));
};

Matter.before = function (path, func) {
    path = path.replace(/^Matter./, '');
    return Common.chainPathBefore(Matter, path, func);
};

Matter.after = function (path, func) {
    console.log(path);
    path = path.replace(/^Matter./, '');
    return Common.chainPathAfter(Matter, path, func);
};

var MatterAttractors = {

    name: 'matter-attractors',
    version: '0.1.4',
    for: 'matter-js@^0.12.0',
  
    /*install: function install(base) {
      base.after('Body.create', function () {
        MatterAttractors.Body.init(this);
      });
  
      base.before('Engine.update', function (engine) {
        MatterAttractors.Engine.update(engine);
      });
    },*/
  
    Body: {
  
      init: function init(body) {
        body.plugin.attractors = body.plugin.attractors || [];
      }
    },
  
    Engine: {
  
      update: function update(engine) {
        var world = engine.world,
          bodies = Composite.allBodies(world);
  
        for (var i = 0; i < bodies.length; i += 1) {
          var bodyA = bodies[i],
            attractors = bodyA.plugin.attractors;
  
          if (attractors && attractors.length > 0) {
            for (var j = i + 1; j < bodies.length; j += 1) {
              var bodyB = bodies[j];
  
              for (var k = 0; k < attractors.length; k += 1) {
                var attractor = attractors[k],
                  forceVector = attractor;
  
                if (Common.isFunction(attractor)) {
                  forceVector = attractor(bodyA, bodyB);
                }
  
                if (forceVector) {
                  Body.applyForce(bodyB, bodyB.position, forceVector);
                }
              }
            }
          }
        }
      }
    },
  
    Attractors: {
      gravityConstant: 0.001,
    }
  };
