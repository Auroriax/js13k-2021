var Common = {};

Common._nextId = 0;
Common._nowStartTime = +(new Date());

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
                        var temp = Common.extend(obj[prop], deepClone);
                        Common.extend(temp, source[prop]);
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
    /*if (typeof window !== 'undefined' && window.performance) {
        if (window.performance.now) {
            return window.performance.now();
        } else if (window.performance.webkitNow) {
            return window.performance.webkitNow();
        }
    }*/

    if (Date.now) {
        return Date.now();
    }

    return (new Date()) - Common._nowStartTime;
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
        Bounds.update(bounds, vertices, null);

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


Vector.perp = function (vector) {
    var negate = 1
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
    Vector.create(0, 0), Vector.create(0, 0),
    Vector.create(0, 0), Vector.create(0, 0),
    Vector.create(0, 0), Vector.create(0, 0)
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
        temp = Vector.mult(Vector.add(vertices[i], vertices[j], null), cross);
        centre = Vector.add(centre, temp, null);
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
        delta = Vector.sub(vertex, point, null);
        vertices[i].x = point.x + delta.x * scaleX;
        vertices[i].y = point.y + delta.y * scaleY;
    }

    return vertices;
};

Vertices.clockwiseSort = function (vertices) {
    var centre = Vertices.mean(vertices);

    vertices.sort(function (vertexA, vertexB) {
        return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
    });

    return vertices;
};

var Composite = {};

Composite.create = function () {
    return {
        id: Common.nextId(),
        parent: null,
        isModified: false,
        bodies: [],
        composites: []
    };
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

    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];

        if (obj.parent !== obj) {
            break;
        }

        Composite.addBody(composite, obj);
    }

    return composite;
};


Composite.remove = function (composite, object) {
    var objects = [].concat(object);

    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];

        Composite.removeBody(composite, obj);
    }

    return composite;
};

Composite.addBody = function (composite, body) {
    composite.bodies.push(body);
    Composite.setModified(composite, true, true, false);
    return composite;
};


Composite.removeBody = function (composite, body) {
    var position = Common.indexOf(composite.bodies, body);
    if (position !== -1) {
        Composite.removeBodyAt(composite, position);
        Composite.setModified(composite, true, true, false);
    }

    return composite;
};


Composite.removeBodyAt = function (composite, position) {
    composite.bodies.splice(position, 1);
    Composite.setModified(composite, true, true, false);
    return composite;
};

Composite.allBodies = function (composite) {
    var bodies = [].concat(composite.bodies);

    for (var i = 0; i < composite.composites.length; i++)
        bodies = bodies.concat(Composite.allBodies(composite.composites[i]));

    return bodies;
};

var Bd = {};
Bd._inertiaScale = 4;
Bd._nextCollidingGroupId = 1;
Bd._nextNonCollidingGroupId = -1;
Bd._nextCategory = 0x0001;

Bd.create = function (options) {
    var defaults = {
        id: Common.nextId(),
        parts: [],
        plugin: {},
        angle: 0,
        vertices: Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40', null),
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
            lineWidth: null
        },
        bounds: null,
        autorot: 0,
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

    var bod = Common.extend(defaults, options);

    _initProperties(bod, options);

    MatterAttractors.init(bod);

    return bod;
};

var _initProperties = function (body, options) {
    options = options || {};


    Bd.set(body, {
        bounds: body.bounds || Bounds.create(body.vertices),
        positionPrev: body.positionPrev || Vector.clone(body.position),
        anglePrev: body.anglePrev || body.angle,
        vertices: body.vertices,
        parts: body.parts || [body],
        parent: body.parent || body
    });

    Bd.setVertices(body, body.vertices)
    Bd.setStatic(body, body.isStatic);
    Bd.setParts(body, body.parts);

    Vertices.rotate(body.vertices, body.angle, body.position);
    Axes.rotate(body.axes, body.angle);
    Bounds.update(body.bounds, body.vertices, body.velocity);

    Bd.set(body, {
        axes: options.axes || body.axes,
        area: options.area || body.area,
        mass: options.mass || body.mass,
        inertia: options.inertia || body.inertia
    });

    Bd.setMass(body, body.mass);
    Bd.setInertia(body, body.inertia)

    var defaultFillStyle = '#14151f',
        defaultStrokeStyle = '#555',
        defaultLineWidth = 0;
    body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
    body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
    body.render.lineWidth = body.render.lineWidth || defaultLineWidth;
};

Bd.set = function (body, settings) {
    var property;

    for (property in settings) {
        if (!Object.prototype.hasOwnProperty.call(settings, property))
            continue;

        var value = settings[property];
        body[property] = value;
    }
};


Bd.setStatic = function (body, isStatic) {
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


Bd.setMass = function (body, mass) {
    var moment = body.inertia / (body.mass / 6);
    body.inertia = moment * (mass / 6);
    body.inverseInertia = 1 / body.inertia;

    body.mass = mass;
    body.inverseMass = 1 / body.mass;
    body.density = body.mass / body.area;
};


Bd.setDensity = function (body, density) {
    Bd.setMass(body, density * body.area);
    body.density = density;
};


Bd.setInertia = function (body, inertia) {
    body.inertia = inertia;
    body.inverseInertia = 1 / body.inertia;
};


Bd.setVertices = function (body, vertices) {

    if (vertices[0].body === body) {
        body.vertices = vertices;
    } else {
        body.vertices = Vertices.create(vertices, body);
    }


    body.axes = Axes.fromVertices(body.vertices);
    body.area = Vertices.area(body.vertices, false);
    Bd.setMass(body, body.density * body.area);


    var centre = Vertices.centre(body.vertices);
    Vertices.translate(body.vertices, centre, -1);


    Bd.setInertia(body, Bd._inertiaScale * Vertices.inertia(body.vertices, body.mass));


    Vertices.translate(body.vertices, body.position, 1);
    Bounds.update(body.bounds, body.vertices, body.velocity);
};


Bd.setParts = function (body, parts) {
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
};


Bd.setPosition = function (body, position) {
    var delta = Vector.sub(position, body.position, null);
    body.positionPrev.x += delta.x;
    body.positionPrev.y += delta.y;

    for (var i = 0; i < body.parts.length; i++) {
        var part = body.parts[i];
        part.position.x += delta.x;
        part.position.y += delta.y;
        Vertices.translate(part.vertices, delta, 1);
        Bounds.update(part.bounds, part.vertices, body.velocity);
    }
};


Bd.setAngle = function (body, angle) {
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

Bd.translate = function (body, translation) {
    Bd.setPosition(body, Vector.add(body.position, translation, null));
};


Bd.rotate = function (body, rotation, point) {
    if (!point) {
        Bd.setAngle(body, body.angle + rotation);
    } else {
        var cos = Math.cos(rotation),
            sin = Math.sin(rotation),
            dx = body.position.x - point.x,
            dy = body.position.y - point.y;

        Bd.setPosition(body, {
            x: point.x + (dx * cos - dy * sin),
            y: point.y + (dx * sin + dy * cos)
        });

        Bd.setAngle(body, body.angle + rotation);
    }
};


Bd.scale = function (body, scaleX, scaleY) {
    var totalArea = 0,
        totalInertia = 0;

    var point = body.position;

    for (var i = 0; i < body.parts.length; i++) {
        var part = body.parts[i];


        Vertices.scale(part.vertices, scaleX, scaleY, point);


        part.axes = Axes.fromVertices(part.vertices);
        part.area = Vertices.area(part.vertices, false);
        Bd.setMass(part, body.density * part.area);


        Vertices.translate(part.vertices, {
            x: -part.position.x,
            y: -part.position.y
        }, 1);
        Bd.setInertia(part, Bd._inertiaScale * Vertices.inertia(part.vertices, part.mass));
        Vertices.translate(part.vertices, {
            x: part.position.x,
            y: part.position.y
        }, 1);

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
            Bd.setMass(body, body.density * totalArea);
            Bd.setInertia(body, totalInertia);
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


Bd.update = function (body, deltaTime, timeScale, correction) {
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

        Vertices.translate(part.vertices, body.velocity, 1);

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


Bd.applyForce = function (body, position, force) {
    body.force.x += force.x;
    body.force.y += force.y;
    var offset = {
        x: position.x - body.position.x,
        y: position.y - body.position.y
    };
    body.torque += offset.x * force.y - offset.y * force.x;
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

Bodies.polygon = function (x, y, sides, radius, options, half = false) {
    options = options || {};

    var theta = 2 * Math.PI / sides,
        path = '',
        offset = theta * 0.5;

    for (var i = 0; i < (half ? sides / 2 : sides); i += 1) {
        var angle = offset + (i * theta),
            xx = Math.cos(angle) * radius,
            yy = Math.sin(angle) * radius;

        path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
    }

    var polygon = {
        position: {
            x: x,
            y: y
        },
        vertices: Vertices.fromPath(path, null)
    };

    return Bd.create(Common.extend(polygon, options));
};


Bodies.fromVertices = function (x, y, vertexSets) {
    var body,
        parts,
        vertices,
        i,
        v;

    var options = {};
    parts = [];

    vertexSets = [vertexSets];

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
        parts[i] = Bd.create(Common.extend(parts[i], options));
    }

    if (parts.length > 1) {

        body = Bd.create(Common.extend({
            parts: parts.slice(0)
        }, options));


        Bd.setPosition(body, {
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

    mouse.element = element || document.body;
    mouse.absolute = {
        x: 0,
        y: 0
    };
    mouse.position = {
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

        if ((bodyA.isStatic) && (bodyB.isStatic))
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


    if (Vector.dot(minOverlap.axis, Vector.sub(bodyB.position, bodyA.position, null)) < 0) {
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
    render.canvas = render.canvas;
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

    return render;
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

Render.world = function (render) {
    var startTime = Common.now(),
        engine = render.engine,
        world = engine.world,
        canvas = render.canvas,
        context = render.context,
        options = render.options,
        timing = render.timing;

    var allBodies = Composite.allBodies(world),

        background = options.background,
        bodies = [],
        i;

    if (render.currentBackground !== background)
        _applyBackground(render, background);


    context.globalCompositeOperation = 'source-in';
    context.fillStyle = "transparent";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'source-over';


    if (options.hasBounds) {

        for (i = 0; i < allBodies.length; i++) {
            var bod = allBodies[i];
            if (Bounds.overlaps(bod.bounds, render.bounds))
                bodies.push(bod);
        }

        Render.startViewTransform(render);
    }

    Render.bodies(render, bodies, context);

    timing.lastElapsed = Common.now() - startTime;
};

Render.bodies = function (render, bodies, context) {
    var c = context,
        options = render.options,
        bod,
        part,
        i,
        k;

    for (i = 0; i < bodies.length; i++) {
        bod = bodies[i];

        for (k = bod.parts.length > 1 ? 1 : 0; k < bod.parts.length; k++) {
            part = bod.parts[k];

            if (!part.render.visible)
                continue;

            if (part.render.opacity !== 1) {
                c.globalAlpha = part.render.opacity;
            }

                c.beginPath();
                c.moveTo(part.vertices[0].x, part.vertices[0].y);

                for (var j = 1; j < part.vertices.length; j++) {
                    if (!part.vertices[j - 1].isInternal) {
                        c.lineTo(part.vertices[j].x, part.vertices[j].y);
                    } else {
                        c.moveTo(part.vertices[j].x, part.vertices[j].y);
                    }

                    if (part.vertices[j].isInternal) {
                        c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                    }
                }

                c.lineTo(part.vertices[0].x, part.vertices[0].y);
                c.closePath();

                if (!options.wireframes) {
                    c.fillStyle = part.render.fillStyle;

                    if (part.render.lineWidth) {
                        c.lineWidth = part.render.lineWidth;
                        c.strokeStyle = part.render.strokeStyle;
                        c.stroke();
                    }

                    c.fill();
                }
            }

            c.globalAlpha = 1;
        }
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

Engine.create = function () {
    var options = {};

    var defaults = {
        positionIterations: 6,
        velocityIterations: 4,
        grid: null,
        timing: {
            timestamp: 0,
            timeScale: 1,
            lastDelta: 0,
            lastElapsed: 0
        }
    };

    var engine = Common.extend(defaults, options);

    engine.world = options.world || Composite.create();
    engine.grid = Grid.create(options.grid || options.broadphase);
    engine.pairs = Pairs.create();

    engine.broadphase = engine.grid;
    engine.metrics = {};

    return engine;
};

Engine.update = function (engine, delta) {
    var startTime = Common.now();

    delta = delta || 1000 / 60;
    var correction = 1;

    var world = engine.world,
        timing = engine.timing,
        grid = engine.grid,
        gridPairs = [],
        i;

    timing.timestamp += delta * timing.timeScale;
    timing.lastDelta = delta * timing.timeScale;

    var allBodies = Composite.allBodies(world);

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

    Resolver.preSolvePosition(pairs.list);
    for (i = 0; i < engine.positionIterations; i++) {
        Resolver.solvePosition(pairs.list, timing.timeScale);
    }
    Resolver.postSolvePosition(allBodies);

    Resolver.preSolveVelocity(pairs.list);
    for (i = 0; i < engine.velocityIterations; i++) {
        Resolver.solveVelocity(pairs.list, timing.timeScale);
    }

    Engine._bodiesClearForces(allBodies);

    engine.timing.lastElapsed = Common.now() - startTime;

    MatterAttractors.update(engine);

    return engine;
};

Engine._bodiesClearForces = function (bodies) {
    for (var i = 0; i < bodies.length; i++) {
        var bod = bodies[i];


        bod.force.x = 0;
        bod.force.y = 0;
        bod.torque = 0;
    }
};

Engine._bodiesUpdate = function (bodies, deltaTime, timeScale, correction, worldBounds) {
    for (var i = 0; i < bodies.length; i++) {
        var bod = bodies[i];

        if (bod.isStatic)
            continue;

        Bd.update(bod, deltaTime, timeScale, correction);
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

        if (!bodyA.isStatic) {
            contactShare = Resolver._positionDampen / bodyA.totalContacts;
            bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
            bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
        }

        if (!bodyB.isStatic) {
            contactShare = Resolver._positionDampen / bodyB.totalContacts;
            bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
            bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
        }
    }
};


Resolver.postSolvePosition = function (bodies) {
    for (var i = 0; i < bodies.length; i++) {
        var bod = bodies[i];


        bod.totalContacts = 0;

        if (bod.positionImpulse.x !== 0 || bod.positionImpulse.y !== 0) {

            for (var j = 0; j < bod.parts.length; j++) {
                var part = bod.parts[j];
                Vertices.translate(part.vertices, bod.positionImpulse, 1);
                Bounds.update(part.bounds, part.vertices, bod.velocity);
                part.position.x += bod.positionImpulse.x;
                part.position.y += bod.positionImpulse.y;
            }


            bod.positionPrev.x += bod.positionImpulse.x;
            bod.positionPrev.y += bod.positionImpulse.y;

            if (Vector.dot(bod.positionImpulse, bod.velocity) < 0) {

                bod.positionImpulse.x = 0;
                bod.positionImpulse.y = 0;
            } else {

                bod.positionImpulse.x *= Resolver._positionWarming;
                bod.positionImpulse.y *= Resolver._positionWarming;
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


                if (!bodyA.isStatic) {
                    offset = Vector.sub(contactVertex, bodyA.position, tempA);
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offset, impulse) * bodyA.inverseInertia;
                }

                if (!bodyB.isStatic) {
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


            if (!bodyA.isStatic) {
                bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                bodyA.anglePrev += Vector.cross(offsetA, impulse) * bodyA.inverseInertia;
            }

            if (!bodyB.isStatic) {
                bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                bodyB.anglePrev -= Vector.cross(offsetB, impulse) * bodyB.inverseInertia;
            }
        }
    }
};

var Pairs = {};

Pairs._pairMaxIdleLife = 1000;

Pairs.create = function () {
    return {
        table: {},
        list: [],
        collisionStart: [],
        collisionActive: [],
        collisionEnd: []
    };
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
        pairIndex,
        i;

    for (i = 0; i < pairsList.length; i++) {
        pair = pairsList[i];

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
        var bod = bodies[i];

        if (world.bounds && (bod.bounds.max.x < world.bounds.min.x || bod.bounds.min.x > world.bounds.max.x ||
                bod.bounds.max.y < world.bounds.min.y || bod.bounds.min.y > world.bounds.max.y))
            continue;

        var newRegion = Grid._getRegion(grid, bod);


        if (!bod.region || newRegion.id !== bod.region.id || forceUpdate) {

            if (!bod.region || forceUpdate)
                bod.region = newRegion;

            var union = Grid._regionUnion(newRegion, bod.region);

            for (col = union.startCol; col <= union.endCol; col++) {
                for (row = union.startRow; row <= union.endRow; row++) {
                    bucketId = Grid._getBucketId(col, row);
                    bucket = buckets[bucketId];

                    var isInsideNewRegion = (col >= newRegion.startCol && col <= newRegion.endCol &&
                        row >= newRegion.startRow && row <= newRegion.endRow);

                    var isInsideOldRegion = (col >= bod.region.startCol && col <= bod.region.endCol &&
                        row >= bod.region.startRow && row <= bod.region.endRow);


                    if (!isInsideNewRegion && isInsideOldRegion) {
                        if (isInsideOldRegion) {
                            if (bucket)
                                Grid._bucketRemoveBody(grid, bucket, bod);
                        }
                    }

                    if (bod.region === newRegion || (isInsideNewRegion && !isInsideOldRegion) || forceUpdate) {
                        if (!bucket)
                            bucket = Grid._createBucket(buckets, bucketId);
                        Grid._bucketAddBody(grid, bucket, bod);
                    }
                }
            }

            bod.region = newRegion;

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

var MatterAttractors = {

    init: function init(body) {
        body.plugin.attractors = body.plugin.attractors || [];
    },

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

                        forceVector = attractor(bodyA, bodyB);

                        if (forceVector) {
                            Bd.applyForce(bodyB, bodyB.position, forceVector);
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
