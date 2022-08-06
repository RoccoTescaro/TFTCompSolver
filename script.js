class CompSolver 
{
    level;

    lockedComp;
    activeTraits;
    
    nDragons;

    #allChampions;
    entropyComp;

    constructor(level_, lockedComp_ = new Set()) 
    {
        this.level = level_;

        this.lockedComp = new Set(lockedComp_);
        this.activeTraits = this.traits(this.lockedComp);

        this.nDragons = 0;
        for(let champ of this.lockedComp)
            if(data.Champions[champ].class.indexOf('Dragon') != -1)
                this.nDragons++;

        this.#allChampions = new Set();
        let traits_ = this.activeTraits;
        for(let champion in data.Champions)
            this.#allChampions.add(champion);
        this.updateEntropyComp(traits_);

    }

    traits(comp_)
    {
    let traits_ = new Object();

    for(const champ of comp_)
        for(const trait of data.Champions[champ].class)
        {
            if(traits_[trait] == undefined) traits_[trait] = 1;
            else traits_[trait] += 1;

            if(trait == 'Dragon')
                traits_[data.Champions[champ].class[0]] += 2;
            }

    return traits_;
    }

    entropy(index_)
    {
    let sumWeights_ = 0;
    let sumWeightsLog_ = 0;

    for(const elm of this.entropyComp[index_])
    {
        let weight_ = this.weight(elm);
        sumWeights_ += weight_;
        sumWeightsLog_ += weight_*Math.log(weight_);
    }

    return Math.log(sumWeights_)-(sumWeightsLog_) / sumWeights_;
    }

    weight(elm_)
    {
        let cost_ = data.Champions[elm_].cost;
        if(cost_ > 5) cost_ /= 2;

        let percentage_ = data.Percentages[this.level][cost_-1]/100;
        
        let commonTraits_ = this.intersection(new Set(Object.keys(this.activeTraits)),data.Champions[elm_].class);
        let result = 1;
        for(let trait of commonTraits_)
        {
            let newValue = this.activeTraits[trait]+1;
            let index_ = -1;
            for(let level of data.Traits[trait])
                if(newValue > level)
                    index_++;
            if(index_ != -1)
                result = newValue*((1+index_)/data.Traits[trait].length);
        }

        return percentage_*(result+cost_);  
    }

    bestEntropy()
    {
    let index_ = 0;
    let bestEntropy_ = 999999;
    for(let i = 0; i < this.entropyComp.length; i++)
    {
        let eval_ = this.entropy(i);
        if(eval_ == bestEntropy_)
        {
            let rand = Math.random();
            if(rand > 0.5)
                index_ = i;
        }
        else if(eval_ < bestEntropy_)
        {
            bestEntropy_ = eval_;
            index_ = i;
        }
    }
    return index_;
    }

    collapse()
    {
        let list_ = this.bestEntropy();
        let pick_ = undefined;
        var weight_ = -1;
        for(let champ of this.entropyComp[list_])
        {
            var squareW = this.weight(champ); 
            //console.log(champ,squareW);
            if(weight_ == squareW)
            {
                let rand = Math.random();
                if(rand > 0.5)
                    pick_ = champ;
            }
            else if(weight_ < squareW)
            {
                weight_ = squareW;
                pick_ = champ;
            }
        }
    
        console.log(pick_);
        this.lockedComp.add(pick_);

        if(data.Champions[pick_].class.indexOf('Dragon') != -1)
            this.nDragons++;

        let traits_ = this.traits(this.lockedComp);
        this.activeTraits = traits_;
        
        this.updateEntropyComp(traits_);

        if(this.lockedComp.size < this.level-this.nDragons)
            this.collapse();
    }

    union(setA, setB) 
    {
        const _union = new Set(setA);
        for (const elem of setB) {
        _union.add(elem);
        }
        return _union;
    }

    intersection(setA, setB)
    {
        const _intersection = new Set();
        for (const elem of setB) {
            if (setA.has(elem)) {
                _intersection.add(elem);
            }
        }
        return _intersection;
    }

    strictRule(traits_, elm_)
    {
        for(const trait of data.Champions[elm_].class)
            if(new Set([...(data.Traits[trait])]).has(traits_[trait]+1))
                return true;
        return false;
    }

    lightRule(traits_, elm_)
    {
        for(const trait of data.Champions[elm_].class)
            if(traits_[trait] != undefined)
                return true;
        return false;
    }

    updateEntropyComp(traits_) //change
    {
        this.entropyComp = new Array();
        for(let i = 0; i < Object.keys(this.activeTraits).length; i++)
        {
            let linkedTraitsComp_ = Array.from(this.#allChampions);
            this.entropyComp.push(new Set(linkedTraitsComp_.filter(elm => 
                !this.lockedComp.has(elm) && this.lightRule(traits_,elm)
            )));
            if(this.entropyComp[i].length == 0)
                this.entropyComp[i] = this.#allChampions;
        }
        if(this.entropyComp.length == 0)
            this.entropyComp.push(this.#allChampions);
    }
}


function update(comp_)
{
    let container = document.getElementById("container");
    container.innerHTML = '';
    for(let champ of comp_.lockedComp)
    {
        let item = document.createElement("div");
        item.classList = "item";
        item.style.backgroundImage = "url(https://rerollcdn.com/characters/Skin/7/"+champ+".png)";
        item.title = champ;
        container.appendChild(item);
    }
}

window.onload = (event) => {
    let comp = new CompSolver(8);
    comp.collapse();
    for(let trait of Object.keys(comp.activeTraits))
    {
        let value = comp.activeTraits[trait];
        if(data.Traits[trait].indexOf(value) != -1)
            console.log(trait, value);
    }
    update(comp);
};