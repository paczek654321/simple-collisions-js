var x = "x"; var y = "y";

var bodies_list = [];
class Body
{
    constructor(pos={x:0, y:0}, size={x:0, y:0}, type="rect", id=bodies_list.length, color="white", velocity={x:0,y:0}, bounce=0.9)
    {
        this.pos = pos
        this.size = size
        this.type = type
        this.id = id
        this.color = color
        this.velocity = velocity
        this.bounce = bounce
    }
}

var canvas;
var canvas_context;
var player = new Body({x: 0, y:0}, {x:1.5, y:0}, "circle", 0, "lime", {x: 0.2, y:0.25}, 1);
var unit_pixel_size = 20;
var canvas_size = {x: 20, y:20};

window.onbeforeunload = function()
{
    return "";
}
window.onload = function()
{
    canvas = document.getElementById("canvas");
    canvas.height = unit_pixel_size*canvas_size[y];
    canvas.width = unit_pixel_size*canvas_size[x];
    canvas_context = canvas.getContext("2d");
    bodies_list.push(player);
    add_world_borders();
    bodies_list.push(new Body({x: 10, y:10}, {x:1.5, y:0}, "circle", bodies_list.length, "red", {x: 0.2, y:0.25}, 1));
    bodies_list.push(new Body({x: 5, y:10}, {x:1.5, y:0}, "circle", bodies_list.length, "purple", {x: 0.2, y:0.25}, 1));
    bodies_list.push(new Body({x: 10, y:5}, {x:3, y:3}, "rect", bodies_list.length, "yellow", {x: 0.2, y:0.25}, 1));

    setInterval(frame, 1000/30);
}
function add_world_borders()
{
    bodies_list.push(new Body({x: -canvas_size[x], y:0}, {x:canvas_size[x], y:canvas_size[y]}, "rect", bodies_list.length));
    bodies_list.push(new Body({x: 0, y:-canvas_size[y]}, {x:canvas_size[x], y:canvas_size[y]}, "rect", bodies_list.length));
    bodies_list.push(new Body({x: canvas_size[x], y:0}, {x:canvas_size[x], y:canvas_size[y]}, "rect", bodies_list.length));
    bodies_list.push(new Body({x: 0, y:canvas_size[y]}, {x:canvas_size[x], y:canvas_size[y]}, "rect", bodies_list.length));
}
function frame()
{
    //player.velocity[y] += 0.01;
    //bodies_list[5].velocity[y] += 0.01;
    move_body(player);
    move_body(bodies_list[5]);
    move_body(bodies_list[6]);
    move_body(bodies_list[7]);
    console.log(bodies_list[5].pos);
    draw();
}
function draw()
{
    canvas_context.fillStyle="#151515";
    canvas_context.fillRect(0, 0, canvas.width, canvas.height);
    for (body in bodies_list)
    {
        draw_body(bodies_list[body]);
    }
}
function draw_body(body)
{
    canvas_context.fillStyle=body.color;
    if (body.type=="rect")
    {
        canvas_context.fillRect(body.pos[x]*unit_pixel_size, body.pos[y]*unit_pixel_size, body.size[x]*unit_pixel_size, body.size[y]*unit_pixel_size);
    }
    else if (body.type=="circle")
    {
        var radius = body.size[x]*unit_pixel_size;
        canvas_context.beginPath();
        canvas_context.arc(body.pos[x]*unit_pixel_size+radius, body.pos[y]*unit_pixel_size+radius, radius, 0, Math.PI * 2, true);
        canvas_context.fill();
    }
}
function move_body(body)
{
    body.pos[x] += body.velocity[x];
    body.pos[y] += body.velocity[y];
    var other_bodies = [...bodies_list];
    other_bodies.splice(body.id, 1);
    for (o in other_bodies)
    {
        var score = 0;
        if (body.type=="circle"){score+=1}
        if (other_bodies[o].type=="circle"){score+=2}
        if (score == 0)
        {
            var displacement_x = rect_rect_collision_1d(body, other_bodies[o], x);
            var displacement_y = rect_rect_collision_1d(body, other_bodies[o], y);
            if (Math.abs(displacement_x) < Math.abs(displacement_y))
            {
                body.pos[x] += displacement_x;
                body.pos[y] += rect_rect_collision_1d(body, other_bodies[o], y);
                displacement_y = 0;
            }
            else
            {
                body.pos[y] += displacement_y;
                body.pos[x] += rect_rect_collision_1d(body, other_bodies[o], x);
                displacement_x = 0;
            }
            var normal = {x:0, y:0};
            var direction = {x: (((displacement_x>0)*2)-1), y: (((displacement_y>0)*2)-1)}
            if (displacement_x != 0){normal[x] = direction[x];}
            else if (displacement_y != 0){normal[y] = direction[y];}
            else {continue;}
            body.velocity = bounce_vector(body.velocity, normal, body.bounce);
        }
        else if (score == 1)
        {
            var displacement_x = circle_rectangle_collision_1d(body, other_bodies[o], x)
            var displacement_y = circle_rectangle_collision_1d(body, other_bodies[o], y);
            body.pos[x] += displacement_x;
            body.pos[y] += displacement_y;
            var normal = {x:0, y:0};
            var direction = {x: (((displacement_x>0)*2)-1), y: (((displacement_y>0)*2)-1)}
            if (displacement_x != 0 && displacement_y != 0){normal = normalize({x:direction[x], y:direction[y]});}
            else if (displacement_x != 0){normal[x] = direction[x];}
            else if (displacement_y != 0){normal[y] = direction[y];}
            else {continue;}
            body.velocity = bounce_vector(body.velocity, normal, body.bounce);
        }
        else if (score == 2)
        {
            var displacement_x = circle_rectangle_collision_1d(other_bodies[o], body, x)
            var displacement_y = circle_rectangle_collision_1d(other_bodies[o], body, y);
            body.pos[x] -= displacement_x;
            body.pos[y] -= displacement_y;
            if (displacement_x!=0 || displacement_y!=0)
            {
                var normal = {x:0, y:0};
                normal[x] = (body.pos[x] + (body.size[x]/2)) - (other_bodies[o].pos[x] + other_bodies[o].size[x]);
                normal[y] = (body.pos[y] + (body.size[y]/2)) - (other_bodies[o].pos[y] + other_bodies[o].size[x]);
                body.velocity = bounce_vector(body.velocity, normalize(normal), body.bounce)
            }
        }
        else if (score == 3)
        {
            var distance_x = Math.abs(body.pos[x] - other_bodies[o].pos[x]);
            var distance_y = Math.abs(body.pos[y] - other_bodies[o].pos[y]);
            var min_distance = body.size[x]+other_bodies[o].size[x];
            var distance = Math.sqrt(distance_x*distance_x+distance_y*distance_y);
            if (distance < min_distance)
            {
                var overlap = min_distance-distance;
                var displacement = move_along_normal(body.pos, other_bodies[o].pos, -overlap);
                body.pos[x] += displacement[x];
                body.pos[y] += displacement[y];
                body.velocity = bounce_vector(body.velocity, {x: displacement[x]/distance, y: displacement[y]/distance}, body.bounce)
            }
        }
    }
}
function normalize(vector)
{
    var magnitude = Math.sqrt(vector[x]*vector[x] + vector[y]*vector[y]);
    return {x:vector[x]/magnitude, y:vector[y]/magnitude};
}
function move_along_normal(moving_point, static_point, distance)
{
    var displacement = {x:0, y:0};
    displacement[x] = static_point[x] - moving_point[x];
    displacement[y] = static_point[y] - moving_point[y];
    displacement = normalize(displacement);
    displacement[x] *= distance;
    displacement[y] *= distance;
    return displacement;
}
function circle_rectangle_collision_1d(circle, rect, axis)
{
    var oposite_axis = y;
    if (axis == y){oposite_axis=x;}
    var circle_radius = circle.size[x];
    var circle_pos = circle.pos[axis] + circle_radius;
    var rect_pos = rect.pos[axis];
    var rect_width = rect.size[axis];
    var rect_height = rect.size[oposite_axis];
    var circle_pos_oposite = circle.pos[oposite_axis];
    var rect_pos_oposite = rect.pos[oposite_axis];

    var circle_height_range = [circle_pos_oposite, circle_pos_oposite+(circle_radius*2)];
    var rect_height_range = [rect_pos_oposite, rect_pos_oposite+rect_height];
    if (!are_overlaping(circle_height_range, rect_height_range)){return 0;}
    
    var intersection = get_range_intersection(circle_height_range, rect_height_range);
    var circle_mid = circle_pos_oposite+circle_radius;
    var collision_point = 0;
    if (circle_mid >= intersection[0] && circle_mid <= intersection[1])
    {collision_point = circle_mid;}
    else if (circle_mid < intersection[0])
    {
        collision_point = intersection[0];
    }
    else
    {
        collision_point = intersection[1];
    }
    var circle_width = circle_radius
    var yoffset = Math.abs(circle_mid-collision_point)
    if (yoffset > 0)
    {
        circle_width = Math.sqrt((circle_radius*circle_radius)-(yoffset*yoffset))
    }
    var distance_left = Math.abs(circle_pos - rect_pos);
    var distance_right = Math.abs(circle_pos-(rect_pos+rect_width));
    var closest_edge = distance_left < distance_right;
    if (closest_edge)
    {
        if (distance_left < circle_width)
        {
            return -((circle_pos+circle_width)-rect_pos);
        }
    }
    else
    {
        if (distance_right<circle_width)
        {
            return rect_pos+rect_width-(circle_pos-circle_width);
        }
    }
    return 0;
}
function rect_rect_collision_1d(rect1, rect2, axis)
{
    var oposite_axis = y;
    if (axis == y){oposite_axis=x;}
    var rect1_height_range = [rect1.pos[oposite_axis], rect1.pos[oposite_axis]+rect1.size[oposite_axis]];
    var rect2_height_range = [rect2.pos[oposite_axis], rect2.pos[oposite_axis]+rect2.size[oposite_axis]];
    if (!are_overlaping(rect1_height_range, rect2_height_range)){return 0;}

    if (Math.abs(rect1.pos[axis]-rect2.pos[axis]) <
        Math.abs(rect1.pos[axis]-(rect2.pos[axis]+rect2.size[axis])))
    {
        if (rect1.pos[axis]+rect1.size[axis]>rect2.pos[axis])
        {
            return -((rect1.pos[axis]+rect1.size[axis]) - rect2.pos[axis]);
        }
    }
    else
    {
        if (rect1.pos[axis] < rect2.pos[axis]+rect2.size[axis])
        {
            return ((rect2.pos[axis]+rect2.size[axis]) - rect1.pos[axis]);
        }
    }
    return 0;
}
function are_overlaping(one, two)
{
    return (one[0] < two[1] && two[0] < one[1]);
}
function get_range_intersection(one, two)
{
    return [Math.max.apply(null, [one[0], two[0]]), Math.min.apply(null, [one[1], two[1]])];
}
function bounce_vector(vector, normal, bounce)
{
    var scalar = 2 * ((vector[x] * normal[x] + vector[y] * normal[y])/
        (normal[x] * normal[x] + normal[y] * normal[y]));
    return {
        x: (vector[x] - normal[x] * scalar) * bounce,
        y: (vector[y] - normal[y] * scalar ) * bounce};

}
