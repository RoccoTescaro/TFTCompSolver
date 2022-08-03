function waveFunction(data_, length_, comp_)
{
    if(comp_ == undefined)
        comp_ = new Array(length_);
    else if(comp_.length < length_)
        for(var i = 0; i < length_-comp_.length; i++)
            comp_.push();

    for(var i = 0; i < length_; i++)
    {
        if(comp_[i] == undefined)
        {
            comp_[i] = new Array();
            for(var j = 0; j < data_.Champions.length; j++)
                comp_[i].push(data_.Champions[j].name);
        }
    }

    return comp_;
}

function entropy(comp_,square_)
{
    var sumWeights = 0;
    var sumWeightsLog = 0;

    for(var i = 0; i < comp_[square_].length; i++)
    {
        var weight_ = weight(comp_, square_, i)
        sumWeights += weight_;
        sumWeightsLog += weight_*Math.log(weight_);
    }

    return Math.log(sumWeights)-(sumWeightsLog) / sumWeights;
}

function weight(comp_, square_, trait_)
{
    return 1; 
    //#TODO weight based on:
    //- level and champ cost
    //- activation of traits 
}

function square(comp_)
{
    var index = 0;
    var bestEntropy = 999999;
    for(var i = 0; i < comp_.length; i++)
    {
        var eval = entropy(comp_, i);
        if(eval < bestEntropy && eval > 0) // if eval == 0 function is already collapsed.
        //a good idea would be to separate wave function and the collapsed one
        //to speed up calulations.
        {
            bestEntropy = eval;
            index = i;
        }
    }
    return index;
}

function collapse(data_, comp_)
{
    var square_ = square(comp_);

    var pick;
    var weight_ = 0;
    for(var i = 0; i < comp_[square_].length; i++)
    {
        var squareW = weight(comp_[square_][i]); 
        if(weight_ < squareW)
        {
            weight_ = squareW;
            pick = comp_[square_][i];
        }
    }

    comp_[square_] = [pick];

    //updates with rules
}